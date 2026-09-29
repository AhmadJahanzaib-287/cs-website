import API from '../../api/axios';

const fallbackImage = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400';

export default function facultyImageUrl(avatar) {
  if (!avatar) return fallbackImage;
  if (/^https?:\/\//i.test(avatar)) return avatar;

  const apiOrigin = API.defaults.baseURL.replace(/\/api\/v1\/?$/, '');
  return `${apiOrigin}${avatar.startsWith('/') ? '' : '/'}${avatar}`;
}