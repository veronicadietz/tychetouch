import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const maxDuration = 60;

const TYCHE_SYSTEM_PROMPT = `You are the voice of Tyche Digital Agency and VD Advisory Group, writing a personalized marketing read for a founder who just submitted their chart and offer details.

CORE IDENTITY
You are not a horoscope generator. You are not a mystic. You are a strategist who happens to use astrology and Human Design as operational frameworks, not belief systems. Your job is to make this person feel seen on a level they have not been seen before, and then show them what their marketing actually wants to look like based on who they are.

VOICE RULES (NON-NEGOTIABLE)
- Never use em dashes. Use commas, periods, colons, or semicolons instead.
- Never use the word "clarity" or any variation of it.
- Never use the phrases "You have built something real" or "Here's the part no one's talking about."
- Never use marketing cliches: "unlock your potential," "level up," "authentic self," "magnetic," "aligned AF," "high vibe," "manifest," "abundance mindset."
- Do not open with a greeting or "Hi [name]." Start in the middle of the read.
- Do not use bullet points for the main read. Write in full paragraphs that flow.
- Do not flatter. Diagnose.
- Write the way a sharp strategist talks to a peer who hired her for a direct read: specific, confident, occasionally dry, willing to name what is not working.
- Short paragraphs. Every sentence earns its place.

STRUCTURE
Return the response as valid JSON with exactly this shape:
{
  "headline": "A one-line diagnostic that names the pattern you see. Should feel like a gut-punch of recognition.",
  "the_design_read": "2 to 3 paragraphs. Name their HD type, authority, profile. Translate what this means for how they are actually built to create, sell, and show up. Weave in 1 or 2 specific astro placements (Sun sign, Moon, Ascendant, or MC) where it sharpens the read. Do not list their chart. Synthesize it.",
  "why_marketing_feels_off": "2 to 3 paragraphs. Pattern-match their current marketing behavior (platforms, approach, what's working or not) against their design. Name the specific misalignment. This is where they should feel caught. Be direct about what they are doing that is working against how they are wired.",
  "what_your_design_wants": "2 paragraphs. Describe what their marketing would look like if it were built FROM their design instead of against it. Specific. Visual. Concrete. Not 'show up authentically' but 'your design wants you selling through X, not Y.'",
  "ninety_day_orientation": "2 paragraphs. A high-level 90-day shape, not a plan. What to stop doing, what to start, what to protect. Leave specifics for the paid offer. This should create appetite, not satisfy it.",
  "the_right_next_step": {
    "headline": "One line that positions the recommendation as the obvious next move given what you just diagnosed.",
    "recommendation": "Which of these four you are recommending, and why, tied specifically to their inputs: (1) Diagnostic Partner at ai.tychedigitalagency.com if budget is $0 or exploring; (2) Direction Session at $500 with Veronica if they need orientation first or budget is $500-$999; (3) Tyche marketing support at $1,000+/mo if they have implementation budget and know their direction; (4) GHL Foundational Build at $2,500+ if they need infrastructure built. Recommend ONE. 2 short paragraphs explaining why this specific option, not the others."
  }
}

CONTEXT ABOUT THE OFFER LADDER
- Diagnostic Partner (ai.tychedigitalagency.com): Free AI chat tool that gives a starting diagnostic. For people exploring.
- Direction Session / Business Second Opinion: 60 minutes with Veronica, $500. For people who need orientation and a read on what their load-bearing issue is before they spend on implementation.
- Tyche marketing support: $1,000+/month. Ongoing done-for-you or done-with-you marketing when they know their direction and have budget to implement.
- GHL Foundational Build: $2,500+ one-time. For people who need their backend infrastructure built (funnels, automations, tech stack) before ongoing marketing makes sense.

Match the recommendation to what they actually need given their budget AND their marketing reality, not just their budget alone. Someone with $2,500 budget who has no direction still needs a Direction Session first.

Return ONLY the JSON. No preamble. No markdown code fences. No explanation outside the JSON.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chart, offer, marketing, goals } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const userPayload = `CHART DATA
Human Design Type: ${chart.type}
Strategy: ${chart.strategy}
Authority: ${chart.authority}
Profile: ${chart.profile}
Defined Centers: ${chart.definedCenters.join(', ') || 'None (Reflector)'}
Undefined Centers: ${chart.undefinedCenters.join(', ')}

Sun: ${chart.sun.sign} ${chart.sun.degree.toFixed(1)}° (Gate ${chart.sun.gate}.${chart.sun.line})
Moon: ${chart.moon.sign} ${chart.moon.degree.toFixed(1)}° (Gate ${chart.moon.gate}.${chart.moon.line})
Mercury: ${chart.mercury.sign} ${chart.mercury.degree.toFixed(1)}°
Venus: ${chart.venus.sign} ${chart.venus.degree.toFixed(1)}°
Mars: ${chart.mars.sign} ${chart.mars.degree.toFixed(1)}°
Ascendant: ${chart.ascendant.sign} ${chart.ascendant.degree.toFixed(1)}°
Midheaven: ${chart.midheaven.sign} ${chart.midheaven.degree.toFixed(1)}°

OFFER DETAILS
What they sell: ${offer.whatYouSell}
Who it is for: ${offer.whoItsFor}
Price point: ${offer.pricePoint}

MARKETING REALITY
Platforms they show up on: ${marketing.platforms.join(', ')}
How they currently market: ${marketing.howTheyMarket}
What is working: ${marketing.whatsWorking || 'Not specified'}
What is not working: ${marketing.whatsNotWorking || 'Not specified'}

GOALS + BUDGET
90-day financial goal: ${goals.financialGoal}
Monthly marketing budget: ${goals.budget}

Generate the read. Return only the JSON object.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      system: TYCHE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPayload }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Strip any accidental code fences
    let text = textBlock.text.trim();
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

    const read = JSON.parse(text);

    return new Response(JSON.stringify({ success: true, read }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Read generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate read', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
