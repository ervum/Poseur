import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ClientConfiguration as Configuration } from '@ervum/shared-configuration';

import { LoginData, RegisterData, RecoverUsernameData, RecoverPhoneData, RecoverEmailData, RecoverPasswordData, RecoverUsernameResponse, RecoverPhoneResponse, RecoverEmailResponse, RecoverPasswordResponse, Nullable } from '@ervum/types';
import { InterfaceService } from '../interface/interface';



@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private readonly HTTP: HttpClient = inject(HttpClient);
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);

  private readonly DatabaseURL: string = (Configuration.SlashedProxyURL);

  public readonly IsLoggedIn: WritableSignal<boolean> = signal<boolean>(this.CheckInitialLoggedInState());

  private CheckInitialLoggedInState(): boolean {
    try {
      const SessionState: Nullable<string> = sessionStorage.getItem('IsLoggedIn');

      if (SessionState === 'true') {
        return true;
      }

      const CookieState: Nullable<string> = this.InterfaceService.GetCookie('RememberMe');

      if (CookieState === 'true') {
        return true;
      }
    } catch {
      // Fallback
    }

    return false;
  }

  public SetLoggedIn(State: boolean): void {
    this.IsLoggedIn.set(State);

    try {
      if (State) {
        sessionStorage.setItem('IsLoggedIn', 'true');
      } else {
        sessionStorage.removeItem('IsLoggedIn');
        this.InterfaceService.DeleteCookie('RememberMe');
      }
    } catch {
      // Fallback
    }
  }

  /** Sends a login request to the server. */
  public Login(UserData: LoginData): Observable<LoginData> {
    return this.HTTP.post<LoginData>(`${this.DatabaseURL}/authentication/login`, UserData);
  }

  /** Sends a registration request to the server. */
  public Register(UserData: RegisterData): Observable<RegisterData> {
    return this.HTTP.post<RegisterData>(`${this.DatabaseURL}/authentication/register`, UserData);
  }

  /** Recovers username based on email or phone number. */
  public RecoverUsername(RecoveryData: RecoverUsernameData): Observable<RecoverUsernameResponse> {
    return this.HTTP.post<RecoverUsernameResponse>(`${this.DatabaseURL}/authentication/recover/username`, RecoveryData);
  }

  /** Recovers phone number based on username or email. */
  public RecoverPhone(RecoveryData: RecoverPhoneData): Observable<RecoverPhoneResponse> {
    return this.HTTP.post<RecoverPhoneResponse>(`${this.DatabaseURL}/authentication/recover/phone`, RecoveryData);
  }

  /** Recovers email based on username or phone number. */
  public RecoverEmail(RecoveryData: RecoverEmailData): Observable<RecoverEmailResponse> {
    return this.HTTP.post<RecoverEmailResponse>(`${this.DatabaseURL}/authentication/recover/email`, RecoveryData);
  }

  /** Recovers password based on user identifier. */
  public RecoverPassword(RecoveryData: RecoverPasswordData): Observable<RecoverPasswordResponse> {
    return this.HTTP.post<RecoverPasswordResponse>(`${this.DatabaseURL}/authentication/recover/password`, RecoveryData);
  }
}