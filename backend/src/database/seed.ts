import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 3306),
  username: process.env.DB_USERNAME || 'paintco',
  password: process.env.DB_PASSWORD || 'paintco123',
  database: process.env.DB_DATABASE || 'paintco_db',
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  synchronize: true,
  charset: 'utf8mb4',
});

async function seed() {
  await AppDataSource.initialize();
  console.log('🌱 Seeding database...');

  // Users
  const userRepo = AppDataSource.getRepository('users');
  const adminExists = await userRepo.findOne({ where: { email: 'admin@paintco.vn' } });
  if (!adminExists) {
    await userRepo.save([
      { name: 'Admin', email: 'admin@paintco.vn', password: await bcrypt.hash('admin123', 10), role: 'admin' },
      { name: 'Manager', email: 'manager@paintco.vn', password: await bcrypt.hash('manager123', 10), role: 'manager' },
    ]);
    console.log('✅ Users seeded');
  }

  // Categories
  const catRepo = AppDataSource.getRepository('categories');
  const cats = [
    { name: 'Interior Paint', nameVi: 'Sơn nội thất', slug: 'son-noi-that', description: 'Premium interior paints', imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400' },
    { name: 'Exterior Paint', nameVi: 'Sơn ngoại thất', slug: 'son-ngoai-that', description: 'Weatherproof exterior paints', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
    { name: 'Wood Paint', nameVi: 'Sơn gỗ', slug: 'son-go', description: 'Wood protection paints', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
    { name: 'Industrial Paint', nameVi: 'Sơn công nghiệp', slug: 'son-cong-nghiep', description: 'Industrial coatings', imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400' },
  ];
  const savedCats = [];
  for (const cat of cats) {
    let c = await catRepo.findOne({ where: { slug: cat.slug } });
    if (!c) c = await catRepo.save(catRepo.create(cat));
    savedCats.push(c);
  }
  console.log('✅ Categories seeded');

  // Products
  const prodRepo = AppDataSource.getRepository('products');
  const products = [
    { name: 'PaintCo SpotLess Pro', nameVi: 'Sơn Nội Thất SpotLess Pro', shortDesc: 'Công nghệ chống bám bẩn, diệt khuẩn 99%', description: 'Dòng sơn phủ nội thất cao cấp với công nghệ chống bám bẩn tiên tiến và ion bạc diệt khuẩn. Bảo vệ tường nhà khỏi vi khuẩn và nấm mốc.', imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600', priceRange: '350.000 - 550.000 VNĐ/thùng', coverage: '8-10 m²/lít', finish: 'Mờ', brand: 'PaintCo', isFeatured: true, sortOrder: 1, category: savedCats[0] },
    { name: 'PaintCo WeatherGuard Plus', nameVi: 'Sơn Ngoại Thất WeatherGuard Plus', shortDesc: 'Chống thấm, chống UV tuyệt đối 15 năm', description: 'Sơn ngoại thất cao cấp với khả năng chống thấm, chống tia UV và chịu đựng mọi điều kiện thời tiết khắc nghiệt lên đến 15 năm.', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', priceRange: '450.000 - 700.000 VNĐ/thùng', coverage: '6-8 m²/lít', finish: 'Bóng', brand: 'PaintCo', isFeatured: true, sortOrder: 2, category: savedCats[1] },
    { name: 'PaintCo EasyWash Interior', nameVi: 'Sơn Nội Thất EasyWash', shortDesc: 'Dễ lau chùi, bề mặt siêu mịn', description: 'Sơn nội thất với tính năng dễ lau chùi vượt trội, bề mặt mịn màng tạo cảm giác nhẹ nhàng thư giãn cho không gian sống.', imageUrl: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600', priceRange: '280.000 - 420.000 VNĐ/thùng', coverage: '10-12 m²/lít', finish: 'Bán bóng', brand: 'PaintCo', isFeatured: true, sortOrder: 3, category: savedCats[0] },
    { name: 'PaintCo WoodShield Premium', nameVi: 'Sơn Gỗ WoodShield Premium', shortDesc: 'Bảo vệ và tôn vinh vân gỗ tự nhiên', description: 'Sơn gỗ cao cấp bảo vệ bề mặt gỗ khỏi ẩm mốc, mối mọt đồng thời tôn vinh vân gỗ tự nhiên, tạo nét đẹp sang trọng.', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600', priceRange: '180.000 - 320.000 VNĐ/lít', coverage: '12-15 m²/lít', finish: 'Bóng', brand: 'PaintCo', isFeatured: false, sortOrder: 4, category: savedCats[2] },
    { name: 'PaintCo Industrial Epoxy', nameVi: 'Sơn Epoxy Công Nghiệp', shortDesc: 'Chịu hóa chất, bền cơ học cao', description: 'Sơn epoxy công nghiệp chất lượng cao, chịu được hóa chất, dầu mỡ và tải trọng cơ học. Lý tưởng cho nhà máy, xưởng sản xuất.', imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600', priceRange: '800.000 - 1.200.000 VNĐ/thùng', coverage: '4-6 m²/lít', finish: 'Bóng', brand: 'PaintCo', isFeatured: false, sortOrder: 5, category: savedCats[3] },
    { name: 'PaintCo Harmony Anti-Mold', nameVi: 'Sơn Chống Nấm Mốc Harmony', shortDesc: 'Diệt nấm mốc, không độc hại', description: 'Sơn nội thất kháng nấm mốc chuyên dụng, an toàn cho trẻ em và người già. Công nghệ kháng khuẩn tiên tiến bảo vệ sức khỏe gia đình.', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600', priceRange: '320.000 - 480.000 VNĐ/thùng', coverage: '9-11 m²/lít', finish: 'Mờ', brand: 'PaintCo', isFeatured: true, sortOrder: 6, category: savedCats[0] },
  ];
  for (const p of products) {
    const exists = await prodRepo.findOne({ where: { name: p.name } });
    if (!exists) await prodRepo.save(prodRepo.create(p));
  }
  console.log('✅ Products seeded');

  // Colors
  const colorRepo = AppDataSource.getRepository('colors');
  const colors = [
    { name: 'Ivory White', nameVi: 'Trắng Ngà', hex: '#FFFFF0', colorCode: 'PC-001', family: 'Whites', isTrending: true },
    { name: 'Champagne', nameVi: 'Vàng Champagne', hex: '#F7E7CE', colorCode: 'PC-002', family: 'Yellows', isTrending: true },
    { name: 'Dusty Rose', nameVi: 'Hồng Pastel', hex: '#DCAE96', colorCode: 'PC-003', family: 'Pinks', isTrending: true },
    { name: 'Sage Green', nameVi: 'Xanh Sage', hex: '#B2AC88', colorCode: 'PC-004', family: 'Greens', isTrending: true },
    { name: 'Sky Blue', nameVi: 'Xanh Trời', hex: '#87CEEB', colorCode: 'PC-005', family: 'Blues', isTrending: true },
    { name: 'Coral Red', nameVi: 'Đỏ San Hô', hex: '#FF6B6B', colorCode: 'PC-006', family: 'Reds', isTrending: false },
    { name: 'Warm Gray', nameVi: 'Xám Ấm', hex: '#C4B9B0', colorCode: 'PC-007', family: 'Grays', isTrending: true },
    { name: 'Deep Navy', nameVi: 'Xanh Navy Đậm', hex: '#1B3A6B', colorCode: 'PC-008', family: 'Blues', isTrending: false },
    { name: 'Mint Fresh', nameVi: 'Xanh Bạc Hà', hex: '#98D8C8', colorCode: 'PC-009', family: 'Greens', isTrending: true },
    { name: 'Terracotta', nameVi: 'Nâu Đất', hex: '#C07850', colorCode: 'PC-010', family: 'Browns', isTrending: true },
    { name: 'Lavender Mist', nameVi: 'Tím Oải Hương', hex: '#C5A9D0', colorCode: 'PC-011', family: 'Purples', isTrending: true },
    { name: 'Off White', nameVi: 'Trắng Kem', hex: '#FAF0E6', colorCode: 'PC-012', family: 'Whites', isTrending: false },
    { name: 'Forest Green', nameVi: 'Xanh Rừng', hex: '#228B22', colorCode: 'PC-013', family: 'Greens', isTrending: false },
    { name: 'Sunset Orange', nameVi: 'Cam Hoàng Hôn', hex: '#FF7043', colorCode: 'PC-014', family: 'Oranges', isTrending: true },
    { name: 'Pearl Gray', nameVi: 'Xám Ngọc Trai', hex: '#D3D3D3', colorCode: 'PC-015', family: 'Grays', isTrending: false },
    { name: 'Cream Yellow', nameVi: 'Vàng Kem', hex: '#FFFDD0', colorCode: 'PC-016', family: 'Yellows', isTrending: false },
  ];
  for (let i = 0; i < colors.length; i++) {
    const exists = await colorRepo.findOne({ where: { colorCode: colors[i].colorCode } });
    if (!exists) await colorRepo.save(colorRepo.create({ ...colors[i], sortOrder: i }));
  }
  console.log('✅ Colors seeded');

  // News
  const newsRepo = AppDataSource.getRepository('news');
  const newsItems = [
    { title: 'Xu hướng màu sắc 2025: Thiên nhiên trở về trong không gian sống', slug: 'xu-huong-mau-sac-2025', excerpt: 'Năm 2025, xu hướng màu sắc nghiêng về tông đất, xanh lá và kem - phản ánh sự kết nối với thiên nhiên.', content: '<p>Xu hướng màu sắc năm 2025 được các chuyên gia dự báo sẽ xoay quanh ba nhóm chính: tông đất trầm ấm, xanh lá thiên nhiên và trắng kem mềm mại...</p>', imageUrl: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800', author: 'PaintCo Team', category: 'Xu hướng', isFeatured: true, published: true },
    { title: 'Bí quyết chọn màu sơn phòng ngủ giúp ngủ ngon hơn', slug: 'bi-quyet-chon-mau-son-phong-ngu', excerpt: 'Màu sắc ảnh hưởng trực tiếp đến chất lượng giấc ngủ. Khám phá các màu sắc được khuyến khích cho phòng ngủ.', content: '<p>Theo nghiên cứu khoa học, màu sắc trong phòng ngủ có thể ảnh hưởng đến thời gian ngủ và chất lượng giấc ngủ của bạn...</p>', imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', author: 'Design Expert', category: 'Mẹo & Thủ thuật', isFeatured: true, published: true },
    { title: 'PaintCo ra mắt dòng sơn thân thiện môi trường Green Series', slug: 'paintco-ra-mat-green-series', excerpt: 'PaintCo tự hào giới thiệu dòng sản phẩm sơn Green Series - không VOC, an toàn cho gia đình và môi trường.', content: '<p>PaintCo vừa chính thức ra mắt dòng sơn Green Series với cam kết zero VOC (hợp chất hữu cơ dễ bay hơi)...</p>', imageUrl: 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800', author: 'PaintCo PR', category: 'Tin tức công ty', isFeatured: true, published: true },
    { title: 'Cách sơn nhà đúng kỹ thuật - Hướng dẫn từ A đến Z', slug: 'cach-son-nha-dung-ky-thuat', excerpt: 'Hướng dẫn chi tiết quy trình sơn nhà đúng kỹ thuật giúp bề mặt sơn đẹp bền lâu.', content: '<p>Để có một bức tường sơn đẹp và bền, bạn cần tuân thủ đúng quy trình từ khâu chuẩn bị bề mặt đến khi hoàn thiện...</p>', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800', author: 'Technical Team', category: 'Mẹo & Thủ thuật', isFeatured: false, published: true },
    { title: 'Phong thủy màu sắc: Chọn màu sơn theo tuổi và mệnh', slug: 'phong-thuy-mau-sac', excerpt: 'Tìm hiểu cách chọn màu sơn theo nguyên tắc phong thủy để mang lại tài lộc và sức khỏe cho gia đình.', content: '<p>Trong văn hóa Á Đông, màu sắc được tin là có ảnh hưởng đến vận mệnh và năng lượng trong ngôi nhà...</p>', imageUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800', author: 'Feng Shui Expert', category: 'Phong thủy', isFeatured: false, published: true },
  ];
  for (const n of newsItems) {
    const exists = await newsRepo.findOne({ where: { slug: n.slug } });
    if (!exists) await newsRepo.save(newsRepo.create(n));
  }
  console.log('✅ News seeded');

  await AppDataSource.destroy();
  console.log('🎉 Seed completed!');
}

seed().catch(console.error);
