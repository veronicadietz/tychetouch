import { NextRequest, NextResponse } from 'next/server';
import { calculateChart } from '@/lib/astrology';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { birthDate, birthTime, latitude, longitude, timezone } = body;

    if (!birthDate || !birthTime || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: birthDate, birthTime, latitude, longitude' },
        { status: 400 }
      );
    }

    // Parse birth date and time in the specified timezone, convert to UTC
    // birthDate: "YYYY-MM-DD", birthTime: "HH:MM"
    // We need to construct a Date in the user's birth timezone, then convert to UTC
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    // Get the timezone offset at the birth moment using Intl
    // Build a UTC date naively, then compute the timezone offset for that local time
    const tzName = timezone || 'UTC';

    // Build the local-time date by constructing a UTC date with the local components,
    // then figure out what UTC instant corresponds to that local time in tzName
    // We use a common trick: compute the difference between the same instant expressed in UTC
    // and in the target timezone to figure out the offset.
    const localAsUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

    // Find tz offset at this instant
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tzName,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = dtf.formatToParts(localAsUtc);
    const get = (type: string) => parts.find((p) => p.type === type)?.value || '0';
    const tzYear = parseInt(get('year'));
    const tzMonth = parseInt(get('month'));
    const tzDay = parseInt(get('day'));
    let tzHour = parseInt(get('hour'));
    if (tzHour === 24) tzHour = 0;
    const tzMinute = parseInt(get('minute'));
    const tzSecond = parseInt(get('second'));
    const asIfUtc = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, tzSecond);
    const offsetMs = asIfUtc - localAsUtc.getTime();
    const actualUtc = new Date(localAsUtc.getTime() - offsetMs);

    const chart = await calculateChart(actualUtc, latitude, longitude);

    return NextResponse.json({
      success: true,
      chart: {
        type: chart.humanDesign.type,
        strategy: chart.humanDesign.strategy,
        authority: chart.humanDesign.authority,
        profile: chart.humanDesign.profile,
        definedCenters: chart.humanDesign.definedCenters,
        undefinedCenters: chart.humanDesign.undefinedCenters,
        sun: chart.personality.sun,
        moon: chart.personality.moon,
        mercury: chart.personality.mercury,
        venus: chart.personality.venus,
        mars: chart.personality.mars,
        jupiter: chart.personality.jupiter,
        saturn: chart.personality.saturn,
        ascendant: chart.personality.ascendant,
        midheaven: chart.personality.midheaven,
        personalityGates: chart.humanDesign.personalityGates,
        designGates: chart.humanDesign.designGates,
      },
    });
  } catch (error: any) {
    console.error('Chart calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate chart', details: error.message },
      { status: 500 }
    );
  }
}
