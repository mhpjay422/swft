import { useFetcher } from "@remix-run/react";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { z } from "zod";
import { type Section } from "#app/routes/users+/$username_+/project.$projectId.index.tsx";

export const EditSectionFormSchema = z.object({
  title: z.string().optional(),
  sectionId: z.string(),
  ownerId: z.string().min(5),
  index: z.number(),
});

interface TaskProps {
  submissionData: any;
  editSectionTitleRef: React.RefObject<HTMLFormElement>;
  editSectionInputRef: React.RefObject<HTMLInputElement>;
  editSectionFormIndex: number | null;
  index: number;
  invokeSetEditSectionFormIndex: (index: number | null) => void;
  focusCurrentEditSection: (index: number) => void;
  section: Section;
}

export const EditSectionForm: React.FC<TaskProps> = ({
  submissionData,
  editSectionTitleRef,
  editSectionInputRef,
  editSectionFormIndex,
  index,
  invokeSetEditSectionFormIndex,
  focusCurrentEditSection,
  section,
}) => {
  const [editSectionForm, editSectionFields] = useForm({
    id: "edit-section-form",
    constraint: getFieldsetConstraint(EditSectionFormSchema),
    lastSubmission: submissionData,
    onValidate({ formData }) {
      return parse(formData, { schema: EditSectionFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  const editSectionFetcher = useFetcher({ key: "edit-section" });

  return editSectionFormIndex === index ? (
    <editSectionFetcher.Form
      {...editSectionForm.props}
      method="PUT"
      action="/section-edit"
      ref={editSectionTitleRef}
      onSubmit={() => {
        invokeSetEditSectionFormIndex(null);
      }}
      onBlur={() => {
        editSectionFetcher.submit(editSectionTitleRef.current);
        invokeSetEditSectionFormIndex(null);
        editSectionTitleRef.current?.reset();
      }}
      className="w-64"
    >
      <AuthenticityTokenInput />
      <input
        ref={editSectionInputRef}
        type="text"
        {...conform.input(editSectionFields.title)}
        className="max-w-54 overflow-hidden mb-1.5 text-base px-2 h-8 font-medium border-transparent hover:border-input focus:border-input transition"
        defaultValue={section.title}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            invokeSetEditSectionFormIndex(null);
          }
        }}
      />
      <input
        {...conform.input(editSectionFields.ownerId, {
          type: "hidden",
        })}
        value={section.ownerId}
      />
      <input
        {...conform.input(editSectionFields.sectionId, {
          type: "hidden",
        })}
        value={section.id}
      />
      <input
        {...conform.input(editSectionFields.index, {
          type: "hidden",
        })}
        value={index}
      />
    </editSectionFetcher.Form>
  ) : (
    <div
      className="font-semibold pl-2 h-8 w-52 overflow-hidden hover:bg-gray-50 hover:cursor-pointer rounded-lg"
      onClick={() => {
        focusCurrentEditSection(index);
      }}
    >
      <div className="mt-0.5">
        {editSectionFetcher.state !== "idle" &&
        Number(editSectionFetcher.formData?.get("index")) === index
          ? String(editSectionFetcher.formData?.get("title"))
          : section.title}
      </div>
    </div>
  );
};
