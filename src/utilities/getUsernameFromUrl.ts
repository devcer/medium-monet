/**
 *
 * @param url The url to set
 * @returns Promise
 */
export const getUsernameFromUrl = (url: string): string => {
  const urlObj = new URL(url);
  const { host, pathname } = urlObj;
  if (host === 'medium.com') {
    return pathname.split('/')[1].slice(1);
  } else {
    return host.split('.')[0];
  }
};
