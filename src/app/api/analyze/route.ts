import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const PLATFORM_GUIDELINES: Record<string, string> = {
  TikTok:   'TikTok (max 2200 chars, casual/trendy tone, Gen Z friendly)',
  Reels:    'Instagram Reels (max 2200 chars, visual storytelling, lifestyle/aesthetic)',
  Shorts:   'YouTube Shorts (max 5000 chars, informative, searchable keywords)',
  X:        'X/Twitter (max 280 chars, punchy, conversational)',
  Threads:  'Threads (max 500 chars, casual, community-driven)',
  LinkedIn: 'LinkedIn (max 3000 chars, professional tone, thought leadership)',
};

function buildPromptEn(caption: string, platform: string, guide: string): string {
  return [
    'You are an expert SNS content analyst.',
    '',
    `Platform: ${guide}`,
    '',
    'Analyze the following content and return ONLY a valid JSON object. No markdown, no explanation, no code blocks.',
    '',
    `Content:\n${caption}`,
    '',
    'Required JSON structure:',
    '{',
    '  "buzzScore": <integer 0-100, viral potential>,',
    '  "hookScore": <integer 0-100, opening hook strength>,',
    '  "emotionScore": <integer 0-100, emotional impact>,',
    '  "hooks": ["rewritten hook 1", "rewritten hook 2", "rewritten hook 3"],',
    `  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],`,
    '  "improvements": [',
    '    {"title": "Issue title 1", "detail": "Actionable advice 1"},',
    '    {"title": "Issue title 2", "detail": "Actionable advice 2"}',
    '  ]',
    '}',
    '',
    `Rules: hooks=exactly 3 strings in English, hashtags=5 to 7 strings each starting with #, optimized for ${platform}, improvements=exactly 2 objects, return ONLY the JSON object.`,
  ].join('\n');
}

function buildPromptJa(caption: string, platform: string, guide: string): string {
  return [
    'あなたはSNS投稿コンテンツの専門アナリストです。',
    '',
    `プラットフォーム: ${guide}`,
    '',
    '以下のコンテンツを分析し、有効なJSONオブジェクトのみを返してください。マークダウン・説明文・コードブロックは不要です。',
    '',
    `コンテンツ:\n${caption}`,
    '',
    '必要なJSON構造:',
    '{',
    '  "buzzScore": <0から100の整数, バイラル可能性>,',
    '  "hookScore": <0から100の整数, フック強度>,',
    '  "emotionScore": <0から100の整数, 感情的インパクト>,',
    '  "hooks": ["日本語フック案1", "日本語フック案2", "日本語フック案3"],',
    '  "hashtags": ["#タグ1", "#タグ2", "#タグ3", "#タグ4", "#タグ5"],',
    '  "improvements": [',
    '    {"title": "改善点タイトル1", "detail": "具体的なアドバイス1"},',
    '    {"title": "改善点タイトル2", "detail": "具体的なアドバイス2"}',
    '  ]',
    '}',
    '',
    `条件: hooksは日本語で3個, hashtagsは#付きで5から7個(${platform}最適化), improvementsは2個(日本語), JSONオブジェクトのみ返す。`,
  ].join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const { caption, platform, locale } = await req.json() as {
      caption: string;
      platform: string;
      locale: string;
    };

    if (!caption?.trim()) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    const guide = PLATFORM_GUIDELINES[platform] ?? platform;
    const isJa = locale === 'ja';
    const prompt = isJa
      ? buildPromptJa(caption.trim(), platform, guide)
      : buildPromptEn(caption.trim(), platform, guide);

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    const raw = textBlock.text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not extract JSON from response');

    const result = JSON.parse(jsonMatch[0]);
    result.buzzScore    = Math.max(0, Math.min(100, Math.round(Number(result.buzzScore))));
    result.hookScore    = Math.max(0, Math.min(100, Math.round(Number(result.hookScore))));
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
