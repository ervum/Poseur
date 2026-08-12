import { Component, inject, signal, ViewChild, WritableSignal, computed, type Signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginData, RegisterData, FancyMultibuttonItemType, AuthenticationFormFieldType, AuthenticationTabType, FieldErrorDescriptor, ErrorRegistry, Undefinable, Nullable } from '@ervum/types';

import { MultibuttonComponent } from '../shared/components/standalone/multibutton/multibutton';
import { ButtonComponent } from '../shared/components/standalone/button/button';
import { TextboxComponent } from '../shared/components/standalone/textbox/textbox';
import { CheckboxComponent } from '../shared/components/standalone/checkbox/checkbox';
import { ContainerComponent } from '../shared/components/standalone/container/container';
import { TooltipComponent } from '../shared/components/standalone/tooltip/tooltip';

import { TypewriterDirective } from '../shared/directives/typewriter/typewriter.directive';
import { SlideUpDownDirective } from '../shared/directives/slide-up-down/slide-up-down.directive';

import { AuthenticationService } from '../core/services/authentication/authentication';
import { InterfaceService } from '../core/services/interface/interface';
import { NavigationService } from '../core/services/navigation/navigation';

import { forkJoin, timer } from 'rxjs'; 



@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [
    CommonModule,

    MultibuttonComponent,
    ButtonComponent,
    TextboxComponent,
    CheckboxComponent,
    ContainerComponent,
    TooltipComponent,

    TypewriterDirective,
    SlideUpDownDirective
],
  templateUrl: './authentication.html',
  styleUrl: './authentication.scss'
})
export class AuthenticationComponent implements OnInit {
  @ViewChild('MainIdentifierTextbox') private MainIdentifierTextbox!: TextboxComponent;
  @ViewChild('EmailTextbox') private EmailTextbox!: TextboxComponent;
  @ViewChild('PhoneNumberTextbox') private PhoneNumberTextbox!: TextboxComponent;
  @ViewChild('PasswordTextbox') private PasswordTextbox!: TextboxComponent;
  
  private AuthenticationService: AuthenticationService = inject(AuthenticationService);
  private NavigationService: NavigationService = inject(NavigationService);
  public InterfaceService: InterfaceService = inject(InterfaceService);

  private readonly TargetFormFields: AuthenticationFormFieldType[] = ['Email', 'PhoneNumber', 'UserIdentifier', 'Username', 'Password'];

  /**
   * Error descriptors store the translation key and an optional field key for programmatic replacement of "[1]".
   */
  private readonly ErrorDescriptorSignalMap: Record<AuthenticationFormFieldType, WritableSignal<FieldErrorDescriptor[]>> = this.TargetFormFields.reduce(
    (Accumulator: Record<AuthenticationFormFieldType, WritableSignal<FieldErrorDescriptor[]>>, FormField: AuthenticationFormFieldType): Record<AuthenticationFormFieldType, WritableSignal<FieldErrorDescriptor[]>> => {
      Accumulator[FormField] = signal([]);

      return Accumulator;
    },
    {} as Record<AuthenticationFormFieldType, WritableSignal<FieldErrorDescriptor[]>>
  );

  public readonly ErrorActiveSignalMap: Record<AuthenticationFormFieldType, WritableSignal<boolean>> = this.TargetFormFields.reduce(
    (Accumulator: Record<AuthenticationFormFieldType, WritableSignal<boolean>>, FormField: AuthenticationFormFieldType): Record<AuthenticationFormFieldType, WritableSignal<boolean>> => {
      Accumulator[FormField] = signal(false);

      return Accumulator;
    },
    {} as Record<AuthenticationFormFieldType, WritableSignal<boolean>>
  );

  public readonly ErrorMessageMap: Record<AuthenticationFormFieldType, Signal<string>> = this.TargetFormFields.reduce(
    (Accumulator: Record<AuthenticationFormFieldType, Signal<string>>, FormField: AuthenticationFormFieldType): Record<AuthenticationFormFieldType, Signal<string>> => {
      Accumulator[FormField] = computed((): string => this.TranslateDescriptors(this.ErrorDescriptorSignalMap[FormField]()));

      return Accumulator;
    },
    {} as Record<AuthenticationFormFieldType, Signal<string>>
  );

  public readonly SectionHeaderErrorDescriptorSignal: WritableSignal<FieldErrorDescriptor[]> = signal([]);
  public readonly SectionHeaderErrorActiveSignal: WritableSignal<boolean> = signal(false);
  public readonly SectionHeaderErrorMessage: Signal<string> = computed((): string => this.TranslateDescriptors(this.SectionHeaderErrorDescriptorSignal()));

  public readonly RememberMeChecked: WritableSignal<boolean> = signal(false);

  private static GetInitialFormTab(): AuthenticationTabType {
    try {
      const SavedTab: Nullable<string> = sessionStorage.getItem('AuthenticationTab');

      if (SavedTab === 'Sign Up' || SavedTab === 'Sign In') {
        return SavedTab as AuthenticationTabType;
      }
    } catch {
      // Fallback
    }

    return 'Sign In';
  }

  public CurrentFormTab: WritableSignal<AuthenticationTabType> = signal<AuthenticationTabType>(AuthenticationComponent.GetInitialFormTab());
  public SelectedMultibuttonIndex: Signal<number> = computed((): number => (this.CurrentFormTab() === 'Sign Up' ? 1 : 0));

  public AuthenticationButtons: Signal<FancyMultibuttonItemType[]> = computed((): FancyMultibuttonItemType[] => [
    {
      Label: this.InterfaceService.T().SignIn,
      Action: (): void => {
        const IsFromSignUp: boolean = (this.CurrentFormTab() === 'Sign Up');

        let HasVisibleErrors: boolean = false;
        
        for (const [_, ErrorActiveSignal] of Object.entries(this.ErrorActiveSignalMap)) {
          if (ErrorActiveSignal() === true) {
            HasVisibleErrors = true;

            break;
          }
        }

        this.ResetErrors();

        if (IsFromSignUp && HasVisibleErrors) {
          setTimeout((): void => {
            this.SetFormTab('Sign In');
          }, 400);
        } else {
          this.SetFormTab('Sign In');
        }
      }
    },

    {
      Label: this.InterfaceService.T().SignUp,
      Action: (): void => {
        this.ResetErrors();
        this.SetFormTab('Sign Up');
      }
    }
  ]);

  public SetFormTab(Tab: AuthenticationTabType): void {
    this.CurrentFormTab.set(Tab);

    try {
      sessionStorage.setItem('AuthenticationTab', Tab);
    } catch {
      // Fallback
    }
  }
  
  public get IsLoading(): Record<string, boolean> {
    return this.InterfaceService.GetStatusClasses();
  }
  
  /** Classes for the form fields wrapper (sign-up expanded state). */
  public get GetFormFieldsClasses(): Record<string, boolean> {
    return {
      'Is-SignUp': (this.CurrentFormTab() === 'Sign Up')
    };
  }

  /**
   * Translates error descriptors using the active language.
   * If both general ("IsGeneral") and specific errors are present, the general one takes priority.
   * Programmatically replaces "[1]" with the translated field name.
   */
  private TranslateDescriptors(Descriptors: FieldErrorDescriptor[]): string {
    if (!Descriptors || (Descriptors.length === 0)) {
      return '';
    }

    const Dictionary: Record<string, string> = (this.InterfaceService.T() as Record<string, string>);

    const GeneralErrorDescriptor: Undefinable<FieldErrorDescriptor> = Descriptors.find(
      (Descriptor: FieldErrorDescriptor): boolean => (Descriptor.IsGeneral === true)
    );
    const TargetDescriptors: FieldErrorDescriptor[] = GeneralErrorDescriptor ? [GeneralErrorDescriptor] : Descriptors;

    return TargetDescriptors.map((Descriptor: FieldErrorDescriptor): string => {
      let Message: string = Dictionary[Descriptor.Key] ?? Descriptor.RawMessage ?? Descriptor.Key;

      if (Descriptor.FieldKey && Message.includes('[1]')) {
        let FieldName: string = Dictionary[Descriptor.FieldKey] ?? Descriptor.FieldKey;

        if (Message.indexOf('[1]') !== 0) {
          FieldName = FieldName.toLowerCase();
        }

        Message = Message.split('[1]').join(FieldName);
      }

      return Message;
    }).join(' ');
  }

  public ResetErrors(): void {
    for (const FormField of this.TargetFormFields) {
      this.ErrorActiveSignalMap[FormField].set(false);
    }

    this.SectionHeaderErrorActiveSignal.set(false);
  }

  private DisplayErrorTooltips(ErrorObject: any): void {
    this.ResetErrors(); 

    if (!ErrorObject || !ErrorObject.error) {
      this.SectionHeaderErrorDescriptorSignal.set([{ Key: 'Error_00_000', IsGeneral: true }]);
      this.SectionHeaderErrorActiveSignal.set(true);
      
      return;
    }

    const Messages: string[] = Array.isArray(ErrorObject.error.message)
      ? ErrorObject.error.message
      : [ErrorObject.error.message || ErrorObject.error];

    const ErrorDescriptorMap: Record<AuthenticationFormFieldType, FieldErrorDescriptor[]> = this.TargetFormFields.reduce(
      (Accumulator: Record<AuthenticationFormFieldType, FieldErrorDescriptor[]>, FormField: AuthenticationFormFieldType): Record<AuthenticationFormFieldType, FieldErrorDescriptor[]> => {
        Accumulator[FormField] = [];

        return Accumulator;
      },
      {} as Record<AuthenticationFormFieldType, FieldErrorDescriptor[]>
    );
    
    const SectionHeaderDescriptors: FieldErrorDescriptor[] = [];

    for (const Message of Messages) {
      const ErrorCodeSections: string[] = Message.split(':');

      const PossiblePropertyName: string = ErrorCodeSections[0].trim();
      const RawCode: string = (ErrorCodeSections[1] ?? PossiblePropertyName).trim();
      const ResolvedCode: string = (RawCode in ErrorRegistry) ? RawCode : '00_000';

      if (this.TargetFormFields.includes(PossiblePropertyName as AuthenticationFormFieldType)) {
        const PropertyName: AuthenticationFormFieldType = (PossiblePropertyName as AuthenticationFormFieldType);

        ErrorDescriptorMap[PropertyName].push({
          Key: `Error_${ResolvedCode}`,
          FieldKey: PropertyName,
          RawMessage: Message,
          IsGeneral: (ErrorRegistry[ResolvedCode].IsGeneral === true)
        });
      } else {
        SectionHeaderDescriptors.push({
          Key: `Error_${ResolvedCode}`,
          RawMessage: Message,
          IsGeneral: (ErrorRegistry[ResolvedCode].IsGeneral === true)
        });
      }
    }

    for (const FormField of this.TargetFormFields) {
      const CurrentDescriptors: FieldErrorDescriptor[] = ErrorDescriptorMap[FormField];

      if (CurrentDescriptors.length > 0) {
        this.ErrorDescriptorSignalMap[FormField].set(CurrentDescriptors);
        this.ErrorActiveSignalMap[FormField].set(true);
      }
    }

    if (SectionHeaderDescriptors.length > 0) {
      this.SectionHeaderErrorDescriptorSignal.set(SectionHeaderDescriptors);
      this.SectionHeaderErrorActiveSignal.set(true);
    }

    setTimeout((): void => {
      this.ResetErrors();
    }, 5000);
  }

  /** Delegates to the appropriate sign-in or sign-up handler based on the current form type. */
  public HandleSubmit(): void {
    if (this.CurrentFormTab() === 'Sign In') {
      this.HandleSignIn();
    } else {
      this.HandleSignUp();
    }
  }

  /** Initiates the account recovery flow. */
  public HandleAccountRecovery(): void {
    this.NavigationService.NavigateWithAnimation('authentication/recovery');
  }

  ngOnInit(): void {
    const RememberedState: Nullable<string> = this.InterfaceService.GetCookie('RememberMe');

    if (RememberedState === 'true') {
      this.RememberMeChecked.set(true);
    }
  }

  private ValidateFields(Rules: { FieldKey: AuthenticationFormFieldType; Value: string; IsEmailCheck?: boolean; MinLength?: number; }[]): boolean {
    let HasValidationError: boolean = false;

    for (const Rule of Rules) {
      const Value: string = (Rule.FieldKey === 'Password') ? Rule.Value : (Rule.Value).trim();

      if (Value === '') {
        this.ErrorDescriptorSignalMap[Rule.FieldKey].set([{ Key: 'Error_01_000', FieldKey: Rule.FieldKey, IsGeneral: false }]);
        this.ErrorActiveSignalMap[Rule.FieldKey].set(true);
        
        HasValidationError = true;
      } else if (Rule.IsEmailCheck === true) {
        const EmailPattern: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!EmailPattern.test(Value)) {
          this.ErrorDescriptorSignalMap[Rule.FieldKey].set([{ Key: 'Error_01_001', FieldKey: Rule.FieldKey, IsGeneral: false }]);
          this.ErrorActiveSignalMap[Rule.FieldKey].set(true);
          
          HasValidationError = true;
        }
      } else if ((Rule.MinLength !== undefined) && (Value.length < Rule.MinLength)) {
        this.ErrorDescriptorSignalMap[Rule.FieldKey].set([{ Key: 'Error_01_002', FieldKey: Rule.FieldKey, IsGeneral: false }]);
        this.ErrorActiveSignalMap[Rule.FieldKey].set(true);
        
        HasValidationError = true;
      }
    }

    if (HasValidationError) {
      setTimeout((): void => {
        this.ResetErrors();
      }, 5000);
    }

    return !HasValidationError;
  }

  private ValidateSignInFields(): boolean {
    const Rules: { FieldKey: AuthenticationFormFieldType; Value: string; IsEmailCheck?: boolean; MinLength?: number; }[] = [
      { FieldKey: 'UserIdentifier', Value: ((this.MainIdentifierTextbox?.InputValue) ?? '') },
      { FieldKey: 'Password', Value: ((this.PasswordTextbox?.InputValue) ?? ''), MinLength: 6 }
    ];

    return this.ValidateFields(Rules);
  }

  private ValidateSignUpFields(): boolean {
    const Rules: { FieldKey: AuthenticationFormFieldType; Value: string; IsEmailCheck?: boolean; MinLength?: number; }[] = [
      { FieldKey: 'Email', Value: ((this.EmailTextbox?.InputValue) ?? ''), IsEmailCheck: true },
      { FieldKey: 'PhoneNumber', Value: ((this.PhoneNumberTextbox?.InputValue) ?? '') },
      { FieldKey: 'Username', Value: ((this.MainIdentifierTextbox?.InputValue) ?? '') },
      { FieldKey: 'Password', Value: ((this.PasswordTextbox?.InputValue) ?? ''), MinLength: 6 }
    ];

    return this.ValidateFields(Rules);
  }

  /** Sends a sign-in request with the current form values. */
  public HandleSignIn(): void {
    console.log('Sign-In attempt initiated from the Authentication Component!');
    
    this.ResetErrors();

    if (!this.ValidateSignInFields()) {
      return;
    }

    this.InterfaceService.SetStatus('Loading');
    
    const UserPayload: LoginData = {
      UserIdentifier: (((this.MainIdentifierTextbox?.InputValue) ?? '').trim()),
      Password: ((this.PasswordTextbox?.InputValue) ?? '')
    };

    forkJoin([
      this.AuthenticationService.Login(UserPayload),

      timer(50)
    ]).subscribe({
      next: (Response: [LoginData, number]): void => {
        // TODO: Remove before production — logs sensitive user data (password, email, etc.)
        console.log('Successfully signed in:', Response);

        if (this.RememberMeChecked()) {
          this.InterfaceService.SetCookie('RememberMe', 'true');
        } else {
          this.InterfaceService.DeleteCookie('RememberMe');
        }

        this.AuthenticationService.SetLoggedIn(true);

        this.InterfaceService.SetStatus('Success');

        setTimeout((): void => {
          this.NavigationService.NavigateWithAnimation('home');
        }, 500);
      },
      error: (ErrorObject: unknown): void => {
        console.error('Error signing in:', ErrorObject);

        this.InterfaceService.SetStatus('Error');
        this.DisplayErrorTooltips(ErrorObject);
      }
    });
  }

  /** Sends a sign-up request with the current form values. */
  public HandleSignUp(): void {
    console.log('Sign-Up attempt initiated from the Authentication Component!');
    
    this.ResetErrors();

    if (!this.ValidateSignUpFields()) {
      return;
    }

    this.InterfaceService.SetStatus('Loading');

    const UserPayload: RegisterData = {
      Email: (((this.EmailTextbox?.InputValue) ?? '').trim()),
      PhoneNumber: (((this.PhoneNumberTextbox?.InputValue) ?? '').trim()),

      Username: (((this.MainIdentifierTextbox?.InputValue) ?? '').trim()),
      Password: ((this.PasswordTextbox?.InputValue) ?? '')
    };

    forkJoin([
      this.AuthenticationService.Register(UserPayload),

      timer(50)
    ]).subscribe({
      next: (Response: [RegisterData, number]): void => {
        // TODO: Remove before production — logs sensitive user data (password, email, etc.)
        console.log('Successfully signed up:', Response);

        if (this.RememberMeChecked()) {
          this.InterfaceService.SetCookie('RememberMe', 'true');
        } else {
          this.InterfaceService.DeleteCookie('RememberMe');
        }

        this.AuthenticationService.SetLoggedIn(true);

        this.InterfaceService.SetStatus('Success');
      },
      error: (ErrorObject: unknown): void => {
        console.error('Error signing up:', ErrorObject);

        this.InterfaceService.SetStatus('Error');
        this.DisplayErrorTooltips(ErrorObject);
      }
    });
  }

  /** Toggles the global interface theme with a circular ripple transition from the click origin. */
  public ToggleTheme(Event: MouseEvent): void {
    let X: number = Event.clientX;
    let Y: number = Event.clientY;

    if (X === 0 && Y === 0 && Event.currentTarget) {
      const BoundingRectangle: DOMRect = (Event.currentTarget as HTMLElement).getBoundingClientRect();
      X = BoundingRectangle.left + (BoundingRectangle.width / 2);
      Y = BoundingRectangle.top + (BoundingRectangle.height / 2);
    }

    this.InterfaceService.ToggleInterfaceTypeWithTransition(X, Y);
  }
}
