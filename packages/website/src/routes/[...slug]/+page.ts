import type { PageLoad } from './$types';
import navigationData from '$lib/content/navigation.json';
import contentData from '$lib/content/content.json';
import { loadContent } from 'markpage/renderer';

function getContentPathFromUrl(urlPath: string): string | null {
	const cleanPath = urlPath.replace(/^\/+/, '').replace(/\.md$/, '');
	if (!cleanPath) {
		return (navigationData as any[])?.[0]?.path || null;
	}

	const findPath = (items: any[], targetPath: string, parentPath: string = ''): string | null => {
		for (const item of items) {
			const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name;
			if (item.path && targetPath === currentPath) {
				return item.path;
			}
			if (item.items) {
				const found = findPath(item.items, targetPath, currentPath);
				if (found) return found;
			}
		}
		return null;
	};

	return findPath(navigationData as any[], cleanPath);
}

export const load: PageLoad = async ({ url }) => {
	const path = getContentPathFromUrl(url.pathname) || (navigationData as any[])?.[0]?.path || null;
	let content: string | null = null;
	if (path) {
		content = (await loadContent(path, contentData as any)) || null;
	}
	return {
		navigation: navigationData,
		contentPath: path,
		content
	};
};