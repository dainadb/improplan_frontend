import { Component, inject, OnInit, signal } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { UserResponse } from '../../../../shared/models/user-response';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  imports: [],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {

  private readonly profileService = inject(ProfileService);
  private readonly router         = inject(Router);
  private readonly location       = inject(Location);

  readonly user = signal<UserResponse | null>(null);

  ngOnInit(): void {
    this.profileService.getMe().subscribe({
      next: (res) => this.user.set(res.data ?? null),
    });
  }

  goBack(): void {
    this.location.back();
  }

  goToEdit(): void {
    this.router.navigate(['/profile/form']);
  }
}