import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth-service';
import { AuthState } from '../../core/state/auth.state';

@Directive({
  selector: '[hasRole]' // El selector 'hasRole' se usará en las plantillas HTML para aplicar esta directiva 
})
export class HasRoleDirective implements OnInit {

 @Input() hasRole!: string; // El rol requerido para mostrar el contenido. Se marca con '!' para indicar que se asignará un valor antes de su uso, evitando errores de compilación por falta de inicialización.
  
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  private authState = inject(AuthState);

  ngOnInit(): void {
    if (this.authState.hasRole(this.hasRole)) { // Si el usuario tienen el rol requerido, mostramos el contenido
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
