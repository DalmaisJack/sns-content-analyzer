import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const PLATFORM_GUIDELINES: Record<string, string> = {
  TikTok:   'TikTok (max 2200 chars, casual/trendy tone, Gen Z friendly)',
  Reels:    'Instagram Reels (max 2200 chars, visual storytelling, lifestyle/aesthetic)',
  Shorts:   'YouTube Shorts (max 5000 chars, informative, searchable keywords)',
  X:        'X/Twitter (max 280 chars, punchy, conversational, use threads if needed)',
  Threads:  'Threads (max 500 chars, casual, community-driven, Instagram-adjacent)',
  LinkedIn: 'LinkedIn (max 3000 chars, professional tone, value-driven, thought leadership)',
};

export async function POST(req: NextRequest) {
  try {
    const { caption, platform, locale } = await req.json() as {
      caption: string;
      platform: string;
      locale: string;
    };

    if (!caption || !caption.trim()) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    const platformGuide = PLATFORM_GUIDELINES[platform] ?? platform;
    const isJa = locale === 'ja';

    const prompt = isJa
      ? `あなたはSNS短尺動画・投稿コンテンツの専門アナリストです。

プラットフォーム: ${platformGuide}

以下のコンテンツを分析し、日本語でJSONのみ返してください：
"""
${caption.trim()}
"""

以下のJSON形式で厳密に返してください：
{
  "buzzScore": 0〜100の整数（バイラル可能性・シェアされやすさ）,
  "hookScore": 0〜100の整数（冒頭1〜2秒で引きつける力）,
  "emotionScore": 0〜100の整数（喜び・驚き・共感などの感情的インパクト）,
  "hooks": ["代替フック1", "代替フック2", "代替フック3"],
  "hashtags": ["#タグ1", "#タグ2", "#タグ3", "#タグ4", "#タグ5"],
  "improvements": [
    {"title": "改善タイトル1", "detail": "具体的な改善説明1"},
    {"title": "改善タイトル2", "detail": "具体的な改善説明2"}
  ]
}

rules: hooks=3個・日本語, hashtags=5〜7個・#付き・${platform}最適化, improvements=2個・日本語, JSONのみ返す`
      : `You are an expert SNS content analyst.

Platform: ${platformGuide}

Analyze the following content and return ONLY JSON in English:
"""
${caption.trim()}
"""

Return strictly this JSON:
{
  "buzzScore": integer 0-100 (viral potential, shareability),
  "hookScore": integer 0-100 (attention grab in first 1-2 seconds),
  "emotionScore": integer 0-100 (joy, surprise, empathy, inspiration),
  "hooks": ["hook 1", "hook 2", "hook 3"],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "improvements": [
    {"title": "Title 1", "detail": "Actionable detail 1"},
    {"title": "Title 2", "detail": "Actionable detail 2"}
  ]
}

Rules: hooks=3 strings, hashtags=5-7 with #, optimized for ${platform}, improvements=2 objects, return ONLY JSON`;

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    const jsonMatch = textBlock.text.trim().match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not extract JSON from response');

    const result = JSON.parse(jsonMatch[0]);
    result.buzzScore  = Math.max(0, Math.min(100, Math.round(Number(result.buzzScore))));
    result.hookScore  = Math.max(0, Math.min(100, Math.round(Number(result.hookScore))));
    result.emotionScore = Math.max(0, Math.min(100, Math.round(Number(result.emotionScore))));

    return NextResponse.json(result);
  } catch (err) {
    console.error('Analyze error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
