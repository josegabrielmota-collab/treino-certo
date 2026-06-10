import { ApplicationRef, Injectable, signal } from '@angular/core';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

import { firebaseAuth } from './firebase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null | undefined>(undefined);

  constructor(private readonly appRef: ApplicationRef) {
    onAuthStateChanged(firebaseAuth, (user) => {
      this.currentUser.set(user);

      queueMicrotask(() => this.appRef.tick());
    });
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  }

  async cadastrar(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(firebaseAuth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(firebaseAuth);
  }

  get isLoggedIn(): boolean {
    return this.currentUser() !== null && this.currentUser() !== undefined;
  }

  get isReady(): boolean {
    return this.currentUser() !== undefined;
  }

  get nomeUsuario(): string {
    const user = this.currentUser();

    if (!user) {
      return 'Usuário';
    }

    return user.displayName || user.email?.split('@')[0] || 'Usuário';
  }
}