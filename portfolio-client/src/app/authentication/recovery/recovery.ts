import { Component, inject, OnInit, computed, signal, ViewChild, type Signal, type WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Undefinable, FancyDropdownItemType, RecoverUsernameResponse, RecoverPhoneResponse, RecoverEmailResponse, RecoverPasswordResponse } from '@ervum/types';
import { AuthenticationService } from '../../core/services/authentication/authentication';

import { ContainerComponent } from '../../shared/components/standalone/container/container';
import { DropdownComponent } from '../../shared/components/standalone/dropdown/dropdown';
import { ButtonComponent } from '../../shared/components/standalone/button/button';
import { TextboxComponent } from '../../shared/components/standalone/textbox/textbox';
import { TooltipComponent } from '../../shared/components/standalone/tooltip/tooltip';

import { type TranslationDictionary } from '../../core/internationalization';
import { InterfaceService } from '../../core/services/interface/interface';
import { NavigationService } from '../../core/services/navigation/navigation';

import { TypewriterDirective } from '../../shared/directives/typewriter/typewriter.directive';
import { SlideUpDownDirective } from '../../shared/directives/slide-up-down/slide-up-down.directive';



export interface RecoveryResultDisplayItem {
  Value: string;
  Label: string;
};

@Component({
  selector: 'app-recovery',
  standalone: true,
  imports: [
    CommonModule,

    ContainerComponent,
    DropdownComponent,
    ButtonComponent,
    TextboxComponent,
    TooltipComponent,

    TypewriterDirective,
    SlideUpDownDirective
  ],
  templateUrl: './recovery.html',
  styleUrl: './recovery.scss'
})
export class RecoveryComponent implements OnInit {
  @ViewChild('FirstField') private FirstField?: TextboxComponent;
  @ViewChild('SecondField') private SecondField?: TextboxComponent;
  @ViewChild('UniqueField') private UniqueField?: TextboxComponent;

  private Router: Router = inject(Router);

  private NavigationService: NavigationService = inject(NavigationService);
  public InterfaceService: InterfaceService = inject(InterfaceService);
  private AuthenticationService: AuthenticationService = inject(AuthenticationService);

  public RecoveryResults: WritableSignal<RecoveryResultDisplayItem[]> = signal<RecoveryResultDisplayItem[]>([]);

  public FirstFieldErrorActiveSignal: WritableSignal<boolean> = signal(false);
  public FirstFieldErrorMessageSignal: WritableSignal<string> = signal('');

  public SecondFieldErrorActiveSignal: WritableSignal<boolean> = signal(false);
  public SecondFieldErrorMessageSignal: WritableSignal<string> = signal('');

  public UniqueFieldErrorActiveSignal: WritableSignal<boolean> = signal(false);
  public UniqueFieldErrorMessageSignal: WritableSignal<string> = signal('');

  public SectionHeaderErrorActiveSignal: WritableSignal<boolean> = signal(false);
  public SectionHeaderErrorMessageSignal: WritableSignal<string> = signal('');

  public RecoveryOptions: Signal<FancyDropdownItemType[]> = computed(() => [
    { ID: 'Username', Label: this.InterfaceService.T().Username, Action: () => {} },
    { ID: 'PhoneNumber', Label: this.InterfaceService.T().PhoneNumber, Action: () => {} },
    { ID: 'Email', Label: this.InterfaceService.T().Email, Action: () => {} },
    { ID: 'Password', Label: this.InterfaceService.T().Password, Action: () => {} },
  ]);

  public SelectedOption: WritableSignal<Undefinable<FancyDropdownItemType>> = signal<Undefinable<FancyDropdownItemType>>(undefined);

  public SelectedRecoveryType: Signal<string> = computed(() => {
    const Selected: Undefinable<FancyDropdownItemType> = this.SelectedOption();

    if (!Selected) return 'Username';

    if (Selected.ID === 'Username') return 'Username';
    if (Selected.ID === 'PhoneNumber') return 'PhoneNumber';
    if (Selected.ID === 'Email') return 'Email';
    if (Selected.ID === 'Password') return 'Password';

    return 'Username';
  });

  public MainRecoveryResultLabel: Signal<string> = computed(() => {
    const Type: string = this.SelectedRecoveryType();

    if (Type === 'Username') return 'Recovered Username';
    if (Type === 'PhoneNumber') return 'Recovered Phone Number';
    if (Type === 'Email') return 'Recovered Email';
    if (Type === 'Password') return 'Recovered Password';

    return 'Recovered Result';
  });

  public ngOnInit(): void {
    // Wait for options to be available if needed, then set default to 'Password'
    const Options: FancyDropdownItemType[] = this.RecoveryOptions();
    if (Options.length >= 4) {
      this.SelectedOption.set(Options[3]);
    }
  }

  public OnSelectionChange(Item: FancyDropdownItemType): void {
    this.SelectedOption.set(Item);
    this.RecoveryResults.set([]);
    this.ResetErrors();
  }

  public FirstTextboxOnlyAllow: Signal<Undefinable<string>> = computed(() => {
    return this.SelectedRecoveryType() === 'Username' ? '0123456789+-() ' : undefined;
  });

  public SecondTextboxOnlyAllow: Signal<Undefinable<string>> = computed(() => {
    return this.SelectedRecoveryType() === 'Email' ? '0123456789+-() ' : undefined;
  });

  public FirstTextboxMaximumLength: Signal<Undefinable<number>> = computed(() => {
    return this.SelectedRecoveryType() === 'Username' ? 15 : undefined;
  });

  public SecondTextboxMaximumLength: Signal<Undefinable<number>> = computed(() => {
    return this.SelectedRecoveryType() === 'Email' ? 15 : undefined;
  });

  public FirstTextboxIcon: Signal<Undefinable<string>> = computed(() => {
    const Type: string = this.SelectedRecoveryType();
  
    if (Type === 'Username') return 'phone';
    if (Type === 'PhoneNumber' || Type === 'Email') return 'at';
  
    return undefined;
  });

  public SecondTextboxIcon: Signal<Undefinable<string>> = computed(() => {
    const Type: string = this.SelectedRecoveryType();
  
    if (Type === 'Username' || Type === 'PhoneNumber') return 'envelope';
    if (Type === 'Email') return 'phone';
  
    return undefined;
  });

  public FirstTextboxPlaceholder: Signal<string> = computed(() => {
    const Type: string = this.SelectedRecoveryType();
    const T: TranslationDictionary = this.InterfaceService.T();

    if (Type === 'Username') return T.PhoneNumber;
    if (Type === 'PhoneNumber' || Type === 'Email') return T.Username;

    return '';
  });

  public SecondTextboxPlaceholder: Signal<string> = computed(() => {
    const Type: string = this.SelectedRecoveryType();
    const T: TranslationDictionary = this.InterfaceService.T();
  
    if (Type === 'Username' || Type === 'PhoneNumber') return T.Email;
    if (Type === 'Email') return T.PhoneNumber;

    return '';
  });

  public GoBack(): void {
    // Navigate back to authentication
    this.NavigationService.NavigateWithAnimation('authentication');
  }

  public ResetErrors(): void {
    this.FirstFieldErrorActiveSignal.set(false);
    this.SecondFieldErrorActiveSignal.set(false);
    this.UniqueFieldErrorActiveSignal.set(false);
    this.SectionHeaderErrorActiveSignal.set(false);
  }

  private IsValidEmail(EmailString: string): boolean {
    const EmailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return EmailPattern.test(EmailString);
  }

  private IsValidPhoneNumber(PhoneString: string): boolean {
    const DigitsOnly: string = PhoneString.replace(/\D/g, '');
    return DigitsOnly.length >= 6;
  }

  public HandleRecovery(): void {
    this.RecoveryResults.set([]);
    this.ResetErrors();
    const Type: string = this.SelectedRecoveryType();

    if (Type === 'Username') {
      const Phone: string = (this.FirstField?.InputValue ?? '').trim();
      const Email: string = (this.SecondField?.InputValue ?? '').trim();

      if (!Phone && !Email) {
        this.SectionHeaderErrorMessageSignal.set(this.InterfaceService.T().Error_01_004 ?? 'No account was found with the provided details.');
        this.SectionHeaderErrorActiveSignal.set(true);
        this.InterfaceService.SetStatus('Error');
        return;
      }

      if (Email && !this.IsValidEmail(Email)) {
        this.SecondFieldErrorMessageSignal.set(this.InterfaceService.T().Error_01_001 ?? 'The email address introduced is invalid.');
        this.SecondFieldErrorActiveSignal.set(true);
        this.InterfaceService.SetStatus('Error');
        return;
      }

      if (Phone && !this.IsValidPhoneNumber(Phone)) {
        this.FirstFieldErrorMessageSignal.set('The phone number introduced is invalid.');
        this.FirstFieldErrorActiveSignal.set(true);
        this.InterfaceService.SetStatus('Error');
        return;
      }

      this.InterfaceService.SetStatus('Loading');

      this.AuthenticationService.RecoverUsername({
        PhoneNumber: (Phone || undefined),
        Email: (Email || undefined)
      }).subscribe({
        next: (Response: RecoverUsernameResponse): void => {
          this.RecoveryResults.set(Response.Results.map((Item: { Username: string; MatchedBy: string }): RecoveryResultDisplayItem => ({
            Value: Item.Username,
            Label: `for ${Item.MatchedBy}`
          })));
          this.InterfaceService.SetStatus('Success');
        },
        error: (Error: unknown): void => {
          this.SectionHeaderErrorMessageSignal.set(this.InterfaceService.T().Error_01_004 ?? 'No account was found with the provided details.');
          this.SectionHeaderErrorActiveSignal.set(true);
          this.InterfaceService.SetStatus('Error');
        }
      });
    } else if (Type === 'PhoneNumber') {
      const Username: string = (this.FirstField?.InputValue ?? '').trim();
      const Email: string = (this.SecondField?.InputValue ?? '').trim();

      if (!Username && !Email) {
        this.SectionHeaderErrorMessageSignal.set(this.InterfaceService.T().Error_01_004 ?? 'No account was found with the provided details.');
        this.SectionHeaderErrorActiveSignal.set(true);
        this.InterfaceService.SetStatus('Error');
        return;
      }

      if (Email && !this.IsValidEmail(Email)) {
        this.SecondFieldErrorMessageSignal.set(this.InterfaceService.T().Error_01_001 ?? 'The email address introduced is invalid.');
        this.SecondFieldErrorActiveSignal.set(true);
        this.InterfaceService.SetStatus('Error');
        return;
      }

      this.InterfaceService.SetStatus('Loading');

      this.AuthenticationService.RecoverPhone({
        Username: (Username || undefined),
        Email: (Email || undefined)
      }).subscribe({
        next: (Response: RecoverPhoneResponse): void => {
          this.RecoveryResults.set(Response.Results.map((Item: { PhoneNumber: string; MatchedBy: string }): RecoveryResultDisplayItem => ({
            Value: Item.PhoneNumber,
            Label: `for ${Item.MatchedBy}`
          })));
          this.InterfaceService.SetStatus('Success');
        },
        error: (Error: unknown): void => {
          this.SectionHeaderErrorMessageSignal.set(this.InterfaceService.T().Error_01_004 ?? 'No account was found with the provided details.');
          this.SectionHeaderErrorActiveSignal.set(true);
          this.InterfaceService.SetStatus('Error');
        }
      });
    } else if (Type === 'Email') {
      const Username: string = (this.FirstField?.InputValue ?? '').trim();
      const Phone: string = (this.SecondField?.InputValue ?? '').trim();

      if (!Username && !Phone) {
        this.SectionHeaderErrorMessageSignal.set(this.InterfaceService.T().Error_01_004 ?? 'No account was found with the provided details.');
        this.SectionHeaderErrorActiveSignal.set(true);
        this.InterfaceService.SetStatus('Error');
        return;
      }

      if (Phone && !this.IsValidPhoneNumber(Phone)) {
        this.SecondFieldErrorMessageSignal.set('The phone number introduced is invalid.');
        this.SecondFieldErrorActiveSignal.set(true);
        this.InterfaceService.SetStatus('Error');
        return;
      }

      this.InterfaceService.SetStatus('Loading');

      this.AuthenticationService.RecoverEmail({
        Username: (Username || undefined),
        PhoneNumber: (Phone || undefined)
      }).subscribe({
        next: (Response: RecoverEmailResponse): void => {
          this.RecoveryResults.set(Response.Results.map((Item: { Email: string; MatchedBy: string }): RecoveryResultDisplayItem => ({
            Value: Item.Email,
            Label: `for ${Item.MatchedBy}`
          })));
          this.InterfaceService.SetStatus('Success');
        },
        error: (Error: unknown): void => {
          this.SectionHeaderErrorMessageSignal.set(this.InterfaceService.T().Error_01_004 ?? 'No account was found with the provided details.');
          this.SectionHeaderErrorActiveSignal.set(true);
          this.InterfaceService.SetStatus('Error');
        }
      });
    } else if (Type === 'Password') {
      const Identifier: string = (this.UniqueField?.InputValue ?? '').trim();

      if (!Identifier) {
        this.UniqueFieldErrorMessageSignal.set(this.InterfaceService.T().Error_01_000?.replace('[1]', this.InterfaceService.T().UserIdentifier) ?? 'User identifier cannot be empty.');
        this.UniqueFieldErrorActiveSignal.set(true);
        this.InterfaceService.SetStatus('Error');
        return;
      }

      this.InterfaceService.SetStatus('Loading');

      this.AuthenticationService.RecoverPassword({
        UserIdentifier: Identifier
      }).subscribe({
        next: (Response: RecoverPasswordResponse): void => {
          this.RecoveryResults.set([{
            Value: Response.Password,
            Label: `for ${Identifier}`
          }]);
          this.InterfaceService.SetStatus('Success');
        },
        error: (Error: unknown): void => {
          this.SectionHeaderErrorMessageSignal.set(this.InterfaceService.T().Error_01_004 ?? 'No account was found with the provided details.');
          this.SectionHeaderErrorActiveSignal.set(true);
          this.InterfaceService.SetStatus('Error');
        }
      });
    }
  }
}
