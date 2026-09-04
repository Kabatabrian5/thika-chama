/**
 * ============================================================
 * DEFAULT AVATAR HELPERS
 * ============================================================
 * Supplies a friendly fallback avatar without adding a gender field
 * to the profile schema. Uploaded profile photos always take priority.
 * Names that are not confidently recognized use a neutral avatar.
 * ============================================================
 */

const feminineNames = new Set([
  'alice',
  'amina',
  'ann',
  'beatrice',
  'carol',
  'catherine',
  'charity',
  'faith',
  'grace',
  'ivy',
  'janet',
  'jane',
  'joy',
  'julia',
  'lilian',
  'linda',
  'lucy',
  'mary',
  'mercy',
  'monica',
  'nancy',
  'patricia',
  'purity',
  'rose',
  'sarah',
  'stella',
  'tabitha',
  'teresa',
  'wambui',
]);

const masculineNames = new Set([
  'alex',
  'brian',
  'charles',
  'daniel',
  'david',
  'elvis',
  'eric',
  'george',
  'ian',
  'james',
  'john',
  'joseph',
  'kevin',
  'mark',
  'martin',
  'michael',
  'moses',
  'nathan',
  'nicholas',
  'peter',
  'samuel',
  'stephen',
  'thomas',
  'victor',
  'william',
]);

export function getDefaultAvatarUrl(fullName: string): string {
  const firstName = fullName.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  const category = feminineNames.has(firstName)
    ? 'female'
    : masculineNames.has(firstName)
      ? 'male'
      : 'neutral';
  const seed = encodeURIComponent(fullName.trim() || 'Thika Road Chama');
  const style = category === 'female' ? 'longHair' : category === 'male' ? 'shortHair' : 'shortHair';
  return `https://api.dicebear.com/9.x/avataaars/png?seed=${seed}&top=${style}&backgroundColor=dff3e3`;
}
