import type { PageLoad } from './$types';
import type { NavigationItem } from '@markpage/svelte/server';
import { NavigationTree } from '@markpage/svelte/server';
import navigationData from '$lib/content/navigation.json';
import contentData from '$lib/content/content.json';
// Note: we render markdown in the Svelte component; here we deliver raw markdown

function getContentPathFromUrl(urlPath: string, navigation: NavigationItem[]): string | null {
	const cleanPath = urlPath.replace(/^\/+/, '').replace(/\.md$/, '');
	if (!cleanPath) {
		return navigation?.[0]?.path || null;
	}

	const findPath = (items: NavigationItem[], targetPath: string, parentPath: string = ''): string | null => {
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

	return findPath(navigation, cleanPath);
}

export const load: PageLoad = async ({ url }) => {
	const navigation = navigationData as NavigationItem[];
	const navigationTree = new NavigationTree(navigation);
	const path = getContentPathFromUrl(url.pathname, navigation) || navigation?.[0]?.path || null;
	let content: string | null = null;
	if (path) {
		content = (contentData as any)[path] ?? null;
	}
	return {
		navigation,
		navigationTree,
		contentPath: path,
		content
	};
};