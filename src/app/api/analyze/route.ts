import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const PLATFORM_GUIDELINES: Record<string, string> = {
  TikTok:   'TikTok (max 2200 chars, casual/trendy tone, Gen Z friendly)',
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
    'Analyze the content below. Return ONLY a valid JSON object — no markdown, no explanation, no code fences.',
    '',
    `Content:\n${caption}`,
    '',
    'Return this exact JSON shape with real values (no placeholder text):',
    '{',
    '  "buzzScore": 72,',
    '  "hookScore": 65,',
    '  "emotionScore": 80,',
    '  "hooks": ["hook text 1", "hook text 2", "hook text 3"],',
    '  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],',
    '  "improvements": [',
    '    {"title": "short title", "detail": "one sentence tip"},',
    '    {"title": "short title", "detail": "one sentence tip"}',
    '  ]',
    '}',
    '',
    'Rules:',
    '- buzzScore / hookScore / emotionScore: integers 0-100 based on your analysis',
    `- hooks: exactly 3 rewritten hook strings in English, optimized for ${platform}`,
    `- hashtags: 5 to 7 strings each starting with #, optimized for ${platform}`,
    '- improvements: exactly 2 objects, each with a short title and one-sentence actionable detail',
    '- Return ONLY the JSON object, nothing else',
  ].join('\n');
}

function buildPromptJa(caption: string, platform: string, guide: string): string {
  return [
    'あなたはSNS投稿コンテンツの専門アナリストです。',
    '',
    `プラットフォーム: ${guide}`,
    '',
    '以下のコンテンツを分析してください。有効なJSONオブジェクトのみを返してください。マークダウン・説明文・コードフェンス不要。',
    '',
    `コンテンツ:\n${caption}`,
    '',
    '以下のJSON形式で実際の値を入れて返してください（プレースホルダー不要）:',
    '{',
    '  "buzzScore": 72,',
    '  "hookScore": 65,',
    '  "emotionScore": 80,',
    '  "hooks": ["フック案1", "フック案2", "フック案3"],',
    '  "hashtags": ["#タグ1", "#タグ2", "#タグ3", "#タグ4", "#タグ5"],',
    '  "improvements": [',
    '    {"title": "改善点タイトル", "detail": "1文の具体的アドバイス"},',
    '    {"title": "改善点タイトル", "detail": "1文の具体的アドバイス"}',
    '  ]',
    '}',
    '',
    'ルール:',
    '- buzzScore / hookScore / emotionScore: 分析結果に基づく0から100の整数',
    `- hooks: 日本語で3個、${platform}向けに最適化したフック案`,
    `- hashtags: #付きで5から7個、${platform}向けに最適化`,
    '- improvements: 2個、各titleは短く・detailは1文のアドバイス',
    '- JSONオブジェクトのみ返す',
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
      system: 'You are a JSON API. Always respond with a single valid JSON object only. Never include markdown, code fences, or explanations.',
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
