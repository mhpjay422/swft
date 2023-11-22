import { useInputEvent } from "@conform-to/react";
import { useId, useRef } from "react";
import { Checkbox, type CheckboxProps } from "#app/components/checkbox.tsx";

export type ListOfErrors = Array<string | null | undefined> | null | undefined;

export function ErrorList({
  id,
  errors,
}: {
  errors?: ListOfErrors;
  id?: string;
}) {
  const errorsToRender = errors?.filter(Boolean);
  if (!errorsToRender?.length) return null;
  return (
    <ul id={id} className="flex flex-col gap-1">
      {errorsToRender.map((e) => (
        <li key={e} className="text-[10px] text-red-600">
          {e}
        </li>
      ))}
    </ul>
  );
}

export function CheckboxField({
  labelProps,
  buttonProps,
  errors,
  className,
}: {
  labelProps: JSX.IntrinsicElements["label"];
  buttonProps: CheckboxProps;
  errors?: ListOfErrors;
  className?: string;
}) {
  const fallbackId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const control = useInputEvent({
    ref: () =>
      buttonRef.current?.form?.elements.namedItem(buttonProps.name ?? ""),
    onFocus: () => buttonRef.current?.focus(),
  });
  const id = buttonProps.id ?? buttonProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <div className="flex gap-2">
        <Checkbox
          id={id}
          ref={buttonRef}
          aria-invalid={errorId ? true : undefined}
          aria-describedby={errorId}
          {...buttonProps}
          onCheckedChange={(state) => {
            control.change(Boolean(state.valueOf()));
            buttonProps.onCheckedChange?.(state);
          }}
          onFocus={(event) => {
            control.focus();
            buttonProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            control.blur();
            buttonProps.onBlur?.(event);
          }}
          type="button"
        />
        <label
          htmlFor={id}
          {...labelProps}
          className="self-center text-body-xs"
        />
      </div>
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
      </div>
    </div>
  );
}
