import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  companyLinks = [
    { title: 'About Us', route: '/about' },
    { title: 'Contact', route: '/contact' },
    { title: 'Terms of Service', route: '/terms' },
    { title: 'Privacy Policy', route: '/privacy' }
  ];

  supportLinks = [
    { title: 'Help Center', route: '/help' },
    { title: 'Documentation', route: '/docs' },
    { title: 'FAQs', route: '/faqs' }
  ];
}