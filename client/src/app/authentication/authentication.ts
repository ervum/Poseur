import {
  Component,
  DestroyRef,
  inject,
  signal,
  ViewChild,
  computed,
  type WritableSignal,
  type Signal,
  type OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  AuthenticationRedirectDelayMilliseconds,
  AuthenticationTabSwitchErrorDelayMilliseconds,
  ErrorTooltipResetDelayMilliseconds,
  IsValidEmailAddress,
  IsValidPhoneNumber,
  PasswordMinimumLength,
  PhoneNumberAllowedCharacters,
  PhoneNumberMaximumLength
} from '@ervum/constants';
import {
  ErrorRegistry,
  type LoginData,
  type RegisterData,
  type FancyMultibuttonItemType,
  type AuthenticationFormFieldType,
  type AuthenticationTabType,
  type FieldErrorDescriptor,
  type Undefinable,
  type Nullable
} from '@ervum/types';

import { forkJoin, timer } from 'rxjs';

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



interface ValidationRuleDescriptor {
  readonly FieldKey:      AuthenticationFormFieldType;
  readonly Value:         string;
  readonly IsEmailCheck?: boolean;
  readonly IsPhoneCheck?: boolean;
  readonly MinLength?:    number;
};



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

  private readonly DestroyReference: DestroyRef = inject(DestroyRef);
  private readonly AuthenticationService: AuthenticationService = inject(AuthenticationService);
  private readonly NavigationService: NavigationService = inject(NavigationService);
  public readonly InterfaceService: InterfaceService = inject(InterfaceService);

  public readonly PhoneNumberAllowedCharacters: string = PhoneNumberAllowedCharacters;
  public readonly PhoneNumberMaximumLength: number = PhoneNumberMaximumLength;

  private readonly TargetFormFields: AuthenticationFormFieldType[] = [
    'Email',
    'PhoneNumber',
    'UserIdentifier',
    'Username',
    'Password',
  ];

  private ErrorResetTimeoutID: Nullable<ReturnType<typeof setTimeout>> = null;
  private TabSwitchTimeoutID: Nullable<ReturnType<typeof setTimeout>> = null;
  private NavigationTimeoutID: Nullable<ReturnType<typeof setTimeout>> = null;

  /**
   * Error descriptors store the translation key and an optional field key for programmatic replacement of "[1]".
   */
  private readonly ErrorDescriptorSignalMap: Record<AuthenticationFormFieldType, WritableSignal<FieldErrorDescriptor[]>> = this.TargetFormFields.reduce(
    (
      Accumulator: Record<AuthenticationFormFieldType, WritableSignal<FieldErrorDescriptor[]>>,
      FormField: AuthenticationFormFieldType
    ): Record<AuthenticationFormFieldType, WritableSignal<FieldErrorDescriptor[]>> => {
      Accumulator[FormField] = signal<FieldErrorDescriptor[]>([]);

      return Accumulator;
    },
    { } as Record<AuthenticationFormFieldType, WritableSignal<FieldErrorDescriptor[]>>
  );

  public readonly ErrorActiveSignalMap: Record<AuthenticationFormFieldType, WritableSignal<boolean>> = this.TargetFormFields.reduce(
    (
      Accumulator: Record<AuthenticationFormFieldType, WritableSignal<boolean>>,
      FormField: AuthenticationFormFieldType
    ): Record<AuthenticationFormFieldType, WritableSignal<boolean>> => {
      Accumulator[FormField] = signal<boolean>(false);

      return Accumulator;
    },
    { } as Record<AuthenticationFormFieldType, WritableSignal<boolean>>
  );

  public readonly ErrorMessageMap: Record<AuthenticationFormFieldType, Signal<string>> = this.TargetFormFields.reduce(
    (
      Accumulator: Record<AuthenticationFormFieldType, Signal<string>>,
      FormField: AuthenticationFormFieldType
    ): Record<AuthenticationFormFieldType, Signal<string>> => {
      Accumulator[FormField] = computed((): string => this.TranslateDescriptors(this.ErrorDescriptorSignalMap[FormField]()));

      return Accumulator;
    },
    { } as Record<AuthenticationFormFieldType, Signal<string>>
  );

  public readonly SectionHeaderErrorDescriptorSignal: WritableSignal<FieldErrorDescriptor[]> = signal<FieldErrorDescriptor[]>([]);
  public readonly SectionHeaderErrorActiveSignal: WritableSignal<boolean> = signal<boolean>(false);
  public readonly SectionHeaderErrorMessage: Signal<string> = computed((): string => this.TranslateDescriptors(this.SectionHeaderErrorDescriptorSignal()));

  public readonly RememberMeChecked: WritableSignal<boolean> = signal<boolean>(false);

  public readonly CurrentFormTab: WritableSignal<AuthenticationTabType> = signal<AuthenticationTabType>(AuthenticationComponent.GetInitialFormTab());
  public readonly SelectedMultibuttonIndex: Signal<number> = computed((): number => ((this.CurrentFormTab()) === 'Sign Up' ? 1 : 0));

  public readonly AuthenticationButtons: Signal<FancyMultibuttonItemType[]> = computed((): FancyMultibuttonItemType[] => [
    {
      Label: (this.InterfaceService.T().SignIn),
      Action: (): void => {
        const IsFromSignUp: boolean = ((this.CurrentFormTab()) === 'Sign Up');

        let HasVisibleErrors: boolean = false;

        for (const [_, ErrorActiveSignal] of Object.entries(this.ErrorActiveSignalMap)) {
          if ((ErrorActiveSignal()) === true) {
            HasVisibleErrors = true;

            break;
          }
        }

        this.ResetErrors();
        this.ClearTabSwitchTimeout();

        if (IsFromSignUp && HasVisibleErrors) {
          this.TabSwitchTimeoutID = setTimeout((): void => {
            this.TabSwitchTimeoutID = null;
            this.SetFormTab('Sign In');
          }, AuthenticationTabSwitchErrorDelayMilliseconds);
        } else {
          this.SetFormTab('Sign In');
        }
      },
    },

    {
      Label: (this.InterfaceService.T().SignUp),
      Action: (): void => {
        this.ResetErrors();
        this.ClearTabSwitchTimeout();
        this.SetFormTab('Sign Up');
      },
    },
  ]);

  constructor() {
    this.DestroyReference.onDestroy((): void => {
      this.ClearErrorResetTimeout();
      this.ClearTabSwitchTimeout();
      this.ClearNavigationTimeout();
    });
  }

  private static GetInitialFormTab(): AuthenticationTabType {
    try {
      const SavedTab: Nullable<string> = sessionStorage.getItem('AuthenticationTab');

      if ((SavedTab === 'Sign Up') || (SavedTab === 'Sign In')) {
        return SavedTab as AuthenticationTabType;
      }
    } catch {
      // Fallback
    }

    return 'Sign In';
  }

  private ClearErrorResetTimeout(): void {
    if ((this.ErrorResetTimeoutID) !== null) {
      clearTimeout(this.ErrorResetTimeoutID);
      this.ErrorResetTimeoutID = null;
    }
  }

  private ScheduleErrorReset(): void {
    this.ClearErrorResetTimeout();

    this.ErrorResetTimeoutID = setTimeout((): void => {
      this.ErrorResetTimeoutID = null;
      this.ResetErrors();
    }, ErrorTooltipResetDelayMilliseconds);
  }

  private ClearTabSwitchTimeout(): void {
    if ((this.TabSwitchTimeoutID) !== null) {
      clearTimeout(this.TabSwitchTimeoutID);
      this.TabSwitchTimeoutID = null;
    }
  }

  private ClearNavigationTimeout(): void {
    if ((this.NavigationTimeoutID) !== null) {
      clearTimeout(this.NavigationTimeoutID);
      this.NavigationTimeoutID = null;
    }
  }

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
      'Is-SignUp': ((this.CurrentFormTab()) === 'Sign Up'),
    };
  }

  /**
   * Translates error descriptors using the active language.
   * If both general ("IsGeneral") and specific errors are present, the general one takes priority.
   * Programmatically replaces "[1]" with the translated field name.
   */
  private TranslateDescriptors(Descriptors: FieldErrorDescriptor[]): string {
    if (!Descriptors || ((Descriptors.length) === 0)) {
      return '';
    }

    const Dictionary: Record<string, string> = (this.InterfaceService.T() as Record<string, string>);

    const GeneralErrorDescriptor: Undefinable<FieldErrorDescriptor> = Descriptors.find(
      (Descriptor: FieldErrorDescriptor): boolean => ((Descriptor.IsGeneral) === true)
    );
    const TargetDescriptors: FieldErrorDescriptor[] = GeneralErrorDescriptor ? [GeneralErrorDescriptor] : Descriptors;

    return TargetDescriptors.map((Descriptor: FieldErrorDescriptor): string => {
      let Message: string = Dictionary[Descriptor.Key] ?? (Descriptor.RawMessage) ?? (Descriptor.Key);

      if ((Descriptor.FieldKey) && Message.includes('[1]')) {
        let FieldName: string = Dictionary[Descriptor.FieldKey] ?? (Descriptor.FieldKey);

        if (Message.indexOf('[1]') !== 0) {
          FieldName = FieldName.toLowerCase();
        }

        Message = Message.split('[1]').join(FieldName);
      }

      return Message;
    }).join(' ');
  }

  public ResetErrors(): void {
    this.ClearErrorResetTimeout();

    for (const FormField of this.TargetFormFields) {
      this.ErrorActiveSignalMap[FormField].set(false);
    }

    this.SectionHeaderErrorActiveSignal.set(false);
  }

  private DisplayErrorTooltips(ErrorObject: any): void {
    this.ResetErrors();

    if (!ErrorObject || !(ErrorObject.error)) {
      this.SectionHeaderErrorDescriptorSignal.set([{ Key: 'Error_00_000', IsGeneral: true }]);
      this.SectionHeaderErrorActiveSignal.set(true);
      this.ScheduleErrorReset();

      return;
    }

    const Messages: string[] = Array.isArray(ErrorObject.error.message)
      ? (ErrorObject.error.message)
      : [(ErrorObject.error.message) || (ErrorObject.error)];

    const ErrorDescriptorMap: Record<AuthenticationFormFieldType, FieldErrorDescriptor[]> = this.TargetFormFields.reduce(
      (
        Accumulator: Record<AuthenticationFormFieldType, FieldErrorDescriptor[]>,
        FormField: AuthenticationFormFieldType
      ): Record<AuthenticationFormFieldType, FieldErrorDescriptor[]> => {
        Accumulator[FormField] = [];

        return Accumulator;
      },
      { } as Record<AuthenticationFormFieldType, FieldErrorDescriptor[]>
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
          Key:        `Error_${ResolvedCode}`,
          FieldKey:   PropertyName,
          RawMessage: Message,
          IsGeneral:  ((ErrorRegistry[ResolvedCode].IsGeneral) === true),
        });
      } else {
        SectionHeaderDescriptors.push({
          Key:        `Error_${ResolvedCode}`,
          RawMessage: Message,
          IsGeneral:  ((ErrorRegistry[ResolvedCode].IsGeneral) === true),
        });
      }
    }

    for (const FormField of this.TargetFormFields) {
      const CurrentDescriptors: FieldErrorDescriptor[] = ErrorDescriptorMap[FormField];

      if ((CurrentDescriptors.length) > 0) {
        this.ErrorDescriptorSignalMap[FormField].set(CurrentDescriptors);
        this.ErrorActiveSignalMap[FormField].set(true);
      }
    }

    if ((SectionHeaderDescriptors.length) > 0) {
      this.SectionHeaderErrorDescriptorSignal.set(SectionHeaderDescriptors);
      this.SectionHeaderErrorActiveSignal.set(true);
    }

    this.ScheduleErrorReset();
  }

  /** Delegates to the appropriate sign-in or sign-up handler based on the current form type. */
  public HandleSubmit(): void {
    if ((this.CurrentFormTab()) === 'Sign In') {
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

  private ValidateFields(Rules: ValidationRuleDescriptor[]): boolean {
    let HasValidationError: boolean = false;

    for (const Rule of Rules) {
      const Value: string = ((Rule.FieldKey) === 'Password') ? (Rule.Value) : (Rule.Value).trim();

      if (Value === '') {
        this.ErrorDescriptorSignalMap[Rule.FieldKey].set([{ Key: 'Error_01_000', FieldKey: (Rule.FieldKey), IsGeneral: false }]);
        this.ErrorActiveSignalMap[Rule.FieldKey].set(true);

        HasValidationError = true;
      } else if (((Rule.IsEmailCheck) === true) && !IsValidEmailAddress(Value)) {
        this.ErrorDescriptorSignalMap[Rule.FieldKey].set([{ Key: 'Error_01_001', FieldKey: (Rule.FieldKey), IsGeneral: false }]);
        this.ErrorActiveSignalMap[Rule.FieldKey].set(true);

        HasValidationError = true;
      } else if (((Rule.IsPhoneCheck) === true) && !IsValidPhoneNumber(Value)) {
        this.ErrorDescriptorSignalMap[Rule.FieldKey].set([{ Key: 'Error_01_008', FieldKey: (Rule.FieldKey), IsGeneral: false }]);
        this.ErrorActiveSignalMap[Rule.FieldKey].set(true);

        HasValidationError = true;
      } else if (((Rule.MinLength) !== undefined) && ((Value.length) < (Rule.MinLength))) {
        this.ErrorDescriptorSignalMap[Rule.FieldKey].set([{ Key: 'Error_01_002', FieldKey: (Rule.FieldKey), IsGeneral: false }]);
        this.ErrorActiveSignalMap[Rule.FieldKey].set(true);

        HasValidationError = true;
      }
    }

    if (HasValidationError) {
      this.ScheduleErrorReset();
    }

    return !HasValidationError;
  }

  private ValidateSignInFields(): boolean {
    const Rules: ValidationRuleDescriptor[] = [
      { FieldKey: 'UserIdentifier', Value: ((this.MainIdentifierTextbox?.InputValue) ?? '') },
      { FieldKey: 'Password',       Value: ((this.PasswordTextbox?.InputValue) ?? ''), MinLength: PasswordMinimumLength },
    ];

    return this.ValidateFields(Rules);
  }

  private ValidateSignUpFields(): boolean {
    const Rules: ValidationRuleDescriptor[] = [
      { FieldKey: 'Email',       Value: ((this.EmailTextbox?.InputValue) ?? ''),       IsEmailCheck: true },
      { FieldKey: 'PhoneNumber', Value: ((this.PhoneNumberTextbox?.InputValue) ?? ''), IsPhoneCheck: true },
      { FieldKey: 'Username',    Value: ((this.MainIdentifierTextbox?.InputValue) ?? '') },
      { FieldKey: 'Password',    Value: ((this.PasswordTextbox?.InputValue) ?? ''),    MinLength: PasswordMinimumLength },
    ];

    return this.ValidateFields(Rules);
  }

  private CompleteAuthenticatedSession(TargetRoute: string): void {
    if (this.RememberMeChecked()) {
      this.InterfaceService.SetCookie('RememberMe', 'true');
    } else {
      this.InterfaceService.DeleteCookie('RememberMe');
    }

    this.AuthenticationService.SetLoggedIn(true);
    this.InterfaceService.SetStatus('Success');

    this.ClearNavigationTimeout();
    this.NavigationTimeoutID = setTimeout((): void => {
      this.NavigationTimeoutID = null;
      this.NavigationService.NavigateWithAnimation(TargetRoute);
    }, AuthenticationRedirectDelayMilliseconds);
  }

  /** Sends a sign-in request with the current form values. */
  public HandleSignIn(): void {
    this.ResetErrors();

    if (!this.ValidateSignInFields()) {
      return;
    }

    this.InterfaceService.SetStatus('Loading');

    const UserPayload: LoginData = {
      UserIdentifier: (((this.MainIdentifierTextbox?.InputValue) ?? '').trim()),
      Password:       ((this.PasswordTextbox?.InputValue) ?? ''),
    };

    forkJoin([
      this.AuthenticationService.Login(UserPayload),
      timer(50),
    ]).subscribe({
      next: (_Response: [LoginData, number]): void => {
        this.CompleteAuthenticatedSession('home');
      },
      error: (ErrorObject: unknown): void => {
        this.InterfaceService.SetStatus('Error');
        this.DisplayErrorTooltips(ErrorObject);
      },
    });
  }

  /** Sends a sign-up request with the current form values. */
  public HandleSignUp(): void {
    this.ResetErrors();

    if (!this.ValidateSignUpFields()) {
      return;
    }

    this.InterfaceService.SetStatus('Loading');

    const UserPayload: RegisterData = {
      Email:       (((this.EmailTextbox?.InputValue) ?? '').trim()),
      PhoneNumber: (((this.PhoneNumberTextbox?.InputValue) ?? '').trim()),
      Username:    (((this.MainIdentifierTextbox?.InputValue) ?? '').trim()),
      Password:    ((this.PasswordTextbox?.InputValue) ?? ''),
    };

    forkJoin([
      this.AuthenticationService.Register(UserPayload),
      timer(50),
    ]).subscribe({
      next: (_Response: [RegisterData, number]): void => {
        this.CompleteAuthenticatedSession('profile');
      },
      error: (ErrorObject: unknown): void => {
        this.InterfaceService.SetStatus('Error');
        this.DisplayErrorTooltips(ErrorObject);
      },
    });
  }
}
