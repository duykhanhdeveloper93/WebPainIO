import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="page-hero" style="background:linear-gradient(135deg,#111,#1a0505,#c8102e);padding:96px 0 64px;text-align:center;color:white">
  <div class="container">
    <span class="section-label" style="color:rgba(255,255,255,.65)">Về chúng tôi</span>
    <h1 style="color:white">PaintCo Vietnam</h1>
    <p style="color:rgba(255,255,255,.65);max-width:560px;margin:0 auto">Hành trình hơn 50 năm mang màu sắc và sự bảo vệ đến mọi ngôi nhà</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center">
      <div>
        <span class="section-label">Câu chuyện của chúng tôi</span>
        <h2 style="margin:12px 0 20px">Thương Hiệu Sơn<br>Hàng Đầu Châu Á</h2>
        <p style="margin-bottom:16px">Được thành lập từ năm 1972, PaintCo đã trở thành một trong những thương hiệu sơn uy tín nhất Châu Á với sự hiện diện tại hơn 30 quốc gia.</p>
        <p style="margin-bottom:16px">Chúng tôi không ngừng đầu tư vào nghiên cứu và phát triển để mang đến những sản phẩm sơn với công nghệ tiên tiến nhất, đảm bảo chất lượng và an toàn cho người dùng.</p>
        <p>Tại Việt Nam, PaintCo đã phục vụ hàng triệu gia đình và công trình xây dựng, từ nhà ở dân dụng đến các công trình công nghiệp quy mô lớn.</p>
        <div style="display:flex;gap:16px;margin-top:32px">
          <a routerLink="/san-pham" class="btn btn-primary">Khám phá sản phẩm</a>
          <a routerLink="/lien-he" class="btn btn-outline">Liên hệ ngay</a>
        </div>
      </div>
      <div>
        <img src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=700&q=80" alt="PaintCo Factory" style="width:100%;border-radius:24px;box-shadow:var(--shadow-lg)">
      </div>
    </div>
  </div>
</section>

<section class="section bg-cream">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Giá trị cốt lõi</span>
      <h2 class="section-title">Cam Kết Của PaintCo</h2>
      <div class="divider"></div>
    </div>
    <div class="grid-3">
      <div *ngFor="let v of values" class="card" style="padding:36px 28px;text-align:center">
        <div style="font-size:3rem;margin-bottom:16px">{{v.icon}}</div>
        <h3 style="margin-bottom:12px">{{v.title}}</h3>
        <p>{{v.desc}}</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header">
      <span class="section-label">Đội ngũ lãnh đạo</span>
      <h2 class="section-title">Ban Lãnh Đạo</h2>
      <div class="divider"></div>
    </div>
    <div class="grid-4">
      <div *ngFor="let m of team" class="card" style="text-align:center;padding:28px 20px">
        <img [src]="m.img" [alt]="m.name" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin:0 auto 16px">
        <h3 style="font-size:1rem;margin-bottom:4px">{{m.name}}</h3>
        <p style="font-size:.82rem;color:var(--red);font-weight:600">{{m.role}}</p>
      </div>
    </div>
  </div>
</section>
  `
})
export class AboutComponent {
  values = [
    { icon:'🎯', title:'Chất lượng hàng đầu', desc:'Mọi sản phẩm đều trải qua kiểm định chất lượng nghiêm ngặt theo tiêu chuẩn quốc tế ISO 9001.' },
    { icon:'🌿', title:'Trách nhiệm môi trường', desc:'Cam kết phát triển bền vững với các sản phẩm thân thiện môi trường, giảm thiểu VOC.' },
    { icon:'💡', title:'Đổi mới sáng tạo', desc:'Không ngừng nghiên cứu và phát triển công nghệ sơn mới để đáp ứng nhu cầu ngày càng cao.' },
  ];
  team = [
    { name:'Nguyễn Văn An', role:'Tổng Giám Đốc', img:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
    { name:'Trần Thị Mai', role:'Giám Đốc Marketing', img:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
    { name:'Lê Hoàng Nam', role:'Giám Đốc Kỹ thuật', img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    { name:'Phạm Thị Lan', role:'Giám Đốc Tài chính', img:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80' },
  ];
}
