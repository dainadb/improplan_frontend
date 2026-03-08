import { Component, inject, OnInit, signal} from '@angular/core';
import { UserResponse } from '../../../../shared/models/user-response';
import { NgClass} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Router} from '@angular/router';

@Component({
  selector: 'app-profile-form',
  imports: [NgClass, FormsModule],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.css',
})
export class ProfileForm implements OnInit {

  private readonly profileService = inject(ProfileService);
  private readonly router         = inject(Router);

  /** Usuario actual: para mostrar los placeholders con los valores guardados */
  readonly user = signal<UserResponse | null>(null);

  // ── Campos del formulario ────────────────────────────────────────────────
  name            = '';
  surnames        = '';
  newPassword     = '';
  checkedPassword = '';

  // ── Errores de validación ────────────────────────────────────────────────
  nameError        = '';
  surnamesError    = '';
  newPasswordError = '';
  passwordMismatch = false;

  // ── Control de envío ─────────────────────────────────────────────────────
  submitted = false;
  readonly isSaving       = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage   = signal<string | null>(null);

  // ── Toggle visibilidad contraseñas ───────────────────────────────────────
  showNewPassword     = false;
  showCheckedPassword = false;

  // ── Ciclo de vida ────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.profileService.getMe().subscribe({
      next: (res) => {
        const u = res.data ?? null;
        this.user.set(u);
        if (u) {
          // Pre-rellenamos para que el usuario vea sus datos actuales en los inputs
          this.name     = u.name;
          this.surnames = u.surnames;
        }
      },
    });
  }

  // ── Validación ───────────────────────────────────────────────────────────

  private validate(): boolean {
    this.nameError        = '';
    this.surnamesError    = '';
    this.newPasswordError = '';
    this.passwordMismatch = false;

    let valid = true;

    if (!this.name.trim() || this.name.trim().length < 2) {
      this.nameError = 'El nombre debe tener al menos 2 caracteres.';
      valid = false;
    }

    if (!this.surnames.trim() || this.surnames.trim().length < 2) {
      this.surnamesError = 'Los apellidos deben tener al menos 2 caracteres.';
      valid = false;
    }

    if (this.newPassword && this.newPassword.length < 6) {
      this.newPasswordError = 'La contraseña debe tener al menos 6 caracteres.';
      valid = false;
    }

    if (this.newPassword && this.newPassword !== this.checkedPassword) {
      this.passwordMismatch = true;
      valid = false;
    }

    return valid;
  }

  // ── Acciones ─────────────────────────────────────────────────────────────

  goBack(): void {
    this.router.navigate(['/profile/page']);
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.validate() || this.isSaving()) return;

    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    // 1. Actualizar nombre y apellidos
    this.profileService.updateProfile({
      name:     this.name.trim(),
      surnames: this.surnames.trim(),
    }).subscribe({
      next: () => {
        // 2. Cambiar contraseña solo si se ha introducido
        if (this.newPassword) {
          this.profileService.changePassword({
            newPassword:     this.newPassword,
            checkedPassword: this.checkedPassword,
          }).subscribe({
            next: () => {
              this.successMessage.set('Perfil y contraseña actualizados correctamente.');
              this.isSaving.set(false);
              this.newPassword     = '';
              this.checkedPassword = '';
              this.submitted       = false;
            },
            error: () => {
              this.errorMessage.set('Perfil actualizado, pero no se pudo cambiar la contraseña.');
              this.isSaving.set(false);
            },
          });
        } else {
          this.successMessage.set('Perfil actualizado correctamente.');
          this.isSaving.set(false);
          this.submitted = false;
        }
      },
      error: () => {
        this.errorMessage.set('No se pudo actualizar el perfil. Inténtalo de nuevo.');
        this.isSaving.set(false);
      },
    });
  }
}