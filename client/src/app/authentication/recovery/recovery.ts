import {
  Component,
  DestroyRef,
  inject,
  computed,
  signal,
  ViewChild,
  type OnInit,
  type Signal,
  type WritableSignal
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ErrorTooltipResetDelayMilliseconds,
  IsValidEmailAddress,
  IsValidPhoneNumber,
  PhoneNumberAllowedCharacters,
  PhoneNumberMaximumLength
} from '@ervum/constants';
import {
  type AuthenticationFormFieldType,
  type FancyDropdownItemType,
  type IconNameType,
  type Nullable,
  type RecoveryTargetType,
  type RecoverUsernameResponse,
  type RecoverPhoneResponse,
  type RecoverEmailResponse,
  type RecoverPasswordResponse,
  type Undefinable
} from '@ervum/types';

import { Observable, map } from 'rxjs';

import { ContainerComponent } from '../../shared/components/standalone/container/container';
import { DropdownComponent } from '../../shared/components/standalone/dropdown/dropdown';
import { ButtonComponent } from '../../shared/components/standalone/button/button';
import { TextboxComponent } from '../../shared/components/standalone/textbox/textbox';
import { TooltipComponent } from '../../shared/components/standalone/tooltip/tooltip';

import { TypewriterDirective } from '../../shared/directives/typewriter/typewriter.directive';
import { SlideUpDownDirective } from '../../shared/directives/slide-up-down/slide-up-down.directive';

import { AuthenticationService } from '../../core/services/authentication/authentication';
import { InterfaceService } from '../../core/services/interface/interface';
import { NavigationService } from '../../core/services/navigation/navigation';
import { type TranslationDictionary } from '../../core/internationalization';



export interface RecoveryRawResultItem {
  readonly Value:     string;
  readonly MatchedBy: string[];
};

export interface RecoveryResultDisplayItem {
  readonly Value: string;
  readonly Label: string;
};

export interface RecoveryFieldConfigurationDescriptor {
  readonly FieldKey:      AuthenticationFormFieldType;
  readonly Placeholder:   string;
  readonly Icon:          IconNameType;
  readonly OnlyAllow:     Undefinable<string>;
  readonly MaximumLength: Undefinable<number>;
};

export interface RecoveryModeDescriptor {
  readonly Type:           RecoveryTargetType;
  readonly ResultLabel:    string;
  readonly IsPasswordMode: boolean;
  readonly FirstField:     Undefinable<RecoveryFieldConfigurationDescriptor>;
  readonly SecondField:    Undefinable<RecoveryFieldConfigurationDescriptor>;
  readonly UniqueField:    Undefinable<RecoveryFieldConfigurationDescriptor>;
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

  private readonly DestroyReference: DestroyRef = inject(DestroyRef);
  private readonly NavigationService: NavigationService = inject(NavigationService);
  public readonly InterfaceService: InterfaceService = inject(InterfaceService);
  private readonly AuthenticationService: AuthenticationService = inject(AuthenticationService);

  private ErrorResetTimeoutID: Nullable<ReturnType<typeof setTimeout>> = null;

  private readonly RawRecoveryResults: WritableSignal<RecoveryRawResultItem[]> = signal<RecoveryRawResultItem[]>([]);

  public readonly FirstFieldErrorActiveSignal: WritableSignal<boolean> = signal<boolean>(false);
  public readonly FirstFieldErrorMessageSignal: WritableSignal<string> = signal<string>('');

  public readonly SecondFieldErrorActiveSignal: WritableSignal<boolean> = signal<boolean>(false);
  public readonly SecondFieldErrorMessageSignal: WritableSignal<string> = signal<string>('');

  public readonly UniqueFieldErrorActiveSignal: WritableSignal<boolean> = signal<boolean>(false);
  public readonly UniqueFieldErrorMessageSignal: WritableSignal<string> = signal<string>('');

  public readonly SectionHeaderErrorActiveSignal: WritableSignal<boolean> = signal<boolean>(false);
  public readonly SectionHeaderErrorMessageSignal: WritableSignal<string> = signal<string>('');

  public readonly RecoveryOptions: Signal<FancyDropdownItemType[]> = computed((): FancyDropdownItemType[] => {
    const Dictionary: TranslationDictionary = this.InterfaceService.T();

    return [
      { ID: 'Username',    Label: (Dictionary.Username),    Action: (): void => {} },
      { ID: 'PhoneNumber', Label: (Dictionary.PhoneNumber), Action: (): void => {} },
      { ID: 'Email',       Label: (Dictionary.Email),       Action: (): void => {} },
      { ID: 'Password',    Label: (Dictionary.Password),    Action: (): void => {} },
    ];
  });

  public readonly SelectedOption: WritableSignal<Undefinable<FancyDropdownItemType>> = signal<Undefinable<FancyDropdownItemType>>(undefined);

  public readonly SelectedRecoveryType: Signal<RecoveryTargetType> = computed((): RecoveryTargetType => {
    const SelectedID: Undefinable<string> = (this.SelectedOption()?.ID);

    if (
      (SelectedID === 'Username') ||
      (SelectedID === 'PhoneNumber') ||
      (SelectedID === 'Email') ||
      (SelectedID === 'Password')
    ) {
      return SelectedID;
    }

    return 'Username';
  });

  public readonly ActiveRecoveryDescriptor: Signal<RecoveryModeDescriptor> = computed((): RecoveryModeDescriptor => {
    const Type: RecoveryTargetType = this.SelectedRecoveryType();
    const Dictionary: TranslationDictionary = this.InterfaceService.T();

    const PhoneFieldDescriptor: RecoveryFieldConfigurationDescriptor = {
      FieldKey:      'PhoneNumber',
      Placeholder:   (Dictionary.PhoneNumber),
      Icon:          'phone',
      OnlyAllow:     PhoneNumberAllowedCharacters,
      MaximumLength: PhoneNumberMaximumLength,
    };

    const EmailFieldDescriptor: RecoveryFieldConfigurationDescriptor = {
      FieldKey:      'Email',
      Placeholder:   (Dictionary.Email),
      Icon:          'envelope',
      OnlyAllow:     undefined,
      MaximumLength: undefined,
    };

    const UsernameFieldDescriptor: RecoveryFieldConfigurationDescriptor = {
      FieldKey:      'Username',
      Placeholder:   (Dictionary.Username),
      Icon:          'at',
      OnlyAllow:     undefined,
      MaximumLength: undefined,
    };

    const UniqueIdentifierFieldDescriptor: RecoveryFieldConfigurationDescriptor = {
      FieldKey:      'UserIdentifier',
      Placeholder:   (Dictionary.UserIdentifier),
      Icon:          'user',
      OnlyAllow:     undefined,
      MaximumLength: undefined,
    };

    const DescriptorsByType: Record<RecoveryTargetType, RecoveryModeDescriptor> = {
      Username: {
        Type:           'Username',
        ResultLabel:    (Dictionary.RecoveredUsername),
        IsPasswordMode: false,
        FirstField:     PhoneFieldDescriptor,
        SecondField:    EmailFieldDescriptor,
        UniqueField:    undefined,
      },
      PhoneNumber: {
        Type:           'PhoneNumber',
        ResultLabel:    (Dictionary.RecoveredPhoneNumber),
        IsPasswordMode: false,
        FirstField:     UsernameFieldDescriptor,
        SecondField:    EmailFieldDescriptor,
        UniqueField:    undefined,
      },
      Email: {
        Type:           'Email',
        ResultLabel:    (Dictionary.RecoveredEmail),
        IsPasswordMode: false,
        FirstField:     UsernameFieldDescriptor,
        SecondField:    PhoneFieldDescriptor,
        UniqueField:    undefined,
      },
      Password: {
        Type:           'Password',
        ResultLabel:    (Dictionary.RecoveredPassword),
        IsPasswordMode: true,
        FirstField:     undefined,
        SecondField:    undefined,
        UniqueField:    UniqueIdentifierFieldDescriptor,
      },
    };

    return DescriptorsByType[Type];
  });

  public readonly RecoveryResults: Signal<RecoveryResultDisplayItem[]> = computed((): RecoveryResultDisplayItem[] => {
    const Dictionary: TranslationDictionary = this.InterfaceService.T();
    const ForPrefix: string = (Dictionary.RecoveryMatchedFor);
    const Joiner: string = ` ${(Dictionary.RecoveryMatchedJoiner)} `;

    return this.RawRecoveryResults().map((Item: RecoveryRawResultItem): RecoveryResultDisplayItem => ({
      Value: (Item.Value),
      Label: `${ForPrefix} ${(Item.MatchedBy).join(Joiner)}`,
    }));
  });

  constructor() {
    this.DestroyReference.onDestroy((): void => {
      this.ClearErrorResetTimeout();
    });
  }

  public ngOnInit(): void {
    const Options: FancyDropdownItemType[] = this.RecoveryOptions();
    if ((Options.length) >= 4) {
      this.SelectedOption.set(Options[3]);
    }
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

  public OnSelectionChange(Item: FancyDropdownItemType): void {
    this.SelectedOption.set(Item);
    this.RawRecoveryResults.set([]);
    this.ResetErrors();
  }

  public GoBack(): void {
    this.NavigationService.NavigateWithAnimation('authentication');
  }

  public ResetErrors(): void {
    this.ClearErrorResetTimeout();
    this.FirstFieldErrorActiveSignal.set(false);
    this.SecondFieldErrorActiveSignal.set(false);
    this.UniqueFieldErrorActiveSignal.set(false);
    this.SectionHeaderErrorActiveSignal.set(false);
  }

  private FormatEmptyFieldMessage(FieldLabel: string): string {
    const Template: string = (this.InterfaceService.T().Error_01_000);
    const FormattedField: string = (Template.indexOf('[1]') === 0)
      ? FieldLabel
      : FieldLabel.toLowerCase();

    return Template.split('[1]').join(FormattedField);
  }

  private ValidateFieldValue(
    FieldKey: AuthenticationFormFieldType,
    Value: string
  ): Nullable<string> {
    const Dictionary: TranslationDictionary = this.InterfaceService.T();

    if ((FieldKey === 'Email') && !IsValidEmailAddress(Value)) {
      return (Dictionary.Error_01_001);
    }

    if ((FieldKey === 'PhoneNumber') && !IsValidPhoneNumber(Value)) {
      return (Dictionary.Error_01_008);
    }

    return null;
  }

  private TriggerErrorState(
    MessageSignal: WritableSignal<string>,
    ActiveSignal: WritableSignal<boolean>,
    Message: string
  ): void {
    MessageSignal.set(Message);
    ActiveSignal.set(true);
    this.InterfaceService.SetStatus('Error');
    this.ScheduleErrorReset();
  }

  private ExecuteRecoveryRequest(Request$: Observable<RecoveryRawResultItem[]>): void {
    this.InterfaceService.SetStatus('Loading');

    Request$.subscribe({
      next: (Items: RecoveryRawResultItem[]): void => {
        this.RawRecoveryResults.set(Items);
        this.InterfaceService.SetStatus('Success');
      },
      error: (_ErrorObject: unknown): void => {
        this.TriggerErrorState(
          this.SectionHeaderErrorMessageSignal,
          this.SectionHeaderErrorActiveSignal,
          (this.InterfaceService.T().Error_01_004)
        );
      },
    });
  }

  public HandleRecovery(): void {
    this.RawRecoveryResults.set([]);
    this.ResetErrors();

    const Descriptor: RecoveryModeDescriptor = this.ActiveRecoveryDescriptor();
    const Dictionary: TranslationDictionary = this.InterfaceService.T();

    if (Descriptor.IsPasswordMode) {
      const Identifier: string = (((this.UniqueField?.InputValue) ?? '').trim());

      if (!Identifier) {
        this.TriggerErrorState(
          this.UniqueFieldErrorMessageSignal,
          this.UniqueFieldErrorActiveSignal,
          this.FormatEmptyFieldMessage(Dictionary.UserIdentifier)
        );

        return;
      }

      this.ExecuteRecoveryRequest(
        this.AuthenticationService.RecoverPassword({ UserIdentifier: Identifier }).pipe(
          map((Response: RecoverPasswordResponse): RecoveryRawResultItem[] => [
            {
              Value:     (Response.Password),
              MatchedBy: [Identifier],
            },
          ])
        )
      );

      return;
    }

    const FirstValue: string = (((this.FirstField?.InputValue) ?? '').trim());
    const SecondValue: string = (((this.SecondField?.InputValue) ?? '').trim());

    if (!FirstValue && !SecondValue) {
      this.TriggerErrorState(
        this.SectionHeaderErrorMessageSignal,
        this.SectionHeaderErrorActiveSignal,
        (Dictionary.Error_01_004)
      );

      return;
    }

    if (FirstValue && (Descriptor.FirstField)) {
      const FirstValidationError: Nullable<string> = this.ValidateFieldValue(
        (Descriptor.FirstField.FieldKey),
        FirstValue
      );

      if (FirstValidationError) {
        this.TriggerErrorState(
          this.FirstFieldErrorMessageSignal,
          this.FirstFieldErrorActiveSignal,
          FirstValidationError
        );

        return;
      }
    }

    if (SecondValue && (Descriptor.SecondField)) {
      const SecondValidationError: Nullable<string> = this.ValidateFieldValue(
        (Descriptor.SecondField.FieldKey),
        SecondValue
      );

      if (SecondValidationError) {
        this.TriggerErrorState(
          this.SecondFieldErrorMessageSignal,
          this.SecondFieldErrorActiveSignal,
          SecondValidationError
        );

        return;
      }
    }

    const RecoveryType: RecoveryTargetType = (Descriptor.Type);

    if (RecoveryType === 'Username') {
      this.ExecuteRecoveryRequest(
        this.AuthenticationService.RecoverUsername({
          PhoneNumber: (FirstValue || undefined),
          Email:       (SecondValue || undefined),
        }).pipe(
          map((Response: RecoverUsernameResponse): RecoveryRawResultItem[] =>
            (Response.Results).map((Item: { Username: string; MatchedBy: string[] }): RecoveryRawResultItem => ({
              Value:     (Item.Username),
              MatchedBy: (Item.MatchedBy),
            }))
          )
        )
      );

      return;
    }

    if (RecoveryType === 'PhoneNumber') {
      this.ExecuteRecoveryRequest(
        this.AuthenticationService.RecoverPhone({
          Username: (FirstValue || undefined),
          Email:    (SecondValue || undefined),
        }).pipe(
          map((Response: RecoverPhoneResponse): RecoveryRawResultItem[] =>
            (Response.Results).map((Item: { PhoneNumber: string; MatchedBy: string[] }): RecoveryRawResultItem => ({
              Value:     (Item.PhoneNumber),
              MatchedBy: (Item.MatchedBy),
            }))
          )
        )
      );

      return;
    }

    this.ExecuteRecoveryRequest(
      this.AuthenticationService.RecoverEmail({
        Username:    (FirstValue || undefined),
        PhoneNumber: (SecondValue || undefined),
      }).pipe(
        map((Response: RecoverEmailResponse): RecoveryRawResultItem[] =>
          (Response.Results).map((Item: { Email: string; MatchedBy: string[] }): RecoveryRawResultItem => ({
            Value:     (Item.Email),
            MatchedBy: (Item.MatchedBy),
          }))
        )
      )
    );
  }
}
