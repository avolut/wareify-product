import { DynamicIcon } from "app/comps/DynamicIcon";
interface MenuItem {
  id: string;
  name: string;
  icon?: string; // Properti optional untuk icon
  url?: string;
  id_parent: string | null;
  sequence: number;
}

export const treeMenu = (data: any[]): any[] => {
  // Fungsi rekursif untuk membangun menu hierarki
  const buildMenu = (parentId: string | null): any[] =>
    data
      .filter((item) => item.id_parent === parentId)
      .sort((a, b) => a.sequence - b.sequence)
      .map((item) => {
        const children = buildMenu(item.id); // Cari child item
        return [
          item.name,
          item.icon ? <DynamicIcon iconName={item.icon} /> : null,
          children.length > 0 ? children : item.url, // Jika ada child, gunakan child; jika tidak, gunakan url
        ];
      });

  // Bangun hierarki utama dengan root parentId === null
  const rootMenu = buildMenu(null);

  // Tangani item tanpa parent valid
  const orphanItems = data.filter(
    (item) =>
      item.id_parent !== null &&
      !data.some((parent) => parent.id === item.id_parent)
  );

  // Tambahkan item tanpa parent valid ke root menu
  orphanItems.forEach((item) => {
    rootMenu.push([
      item.name,
      item.icon ? <DynamicIcon iconName={item.icon} /> : null,
      item.url || [],
    ]);
  });
  return rootMenu;
};
