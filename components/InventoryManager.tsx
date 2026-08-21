import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createBookAction, updateBookAction, deleteBookAction } from "@/lib/actions";
import {
  PageHeader,
  SectionCard,
  TableCard,
  Chip,
  MobileCardList,
  MobileCard,
  MobileCardRow,
  MobileCardEmpty,
  TableEmptyRow,
  buttonStyles,
  inputStyles,
  inputStylesBase,
  inputStylesSm,
} from "@/components/ui";
import { SmartForm, SubmitButton } from "@/components/SmartForm";
import { ActionButton } from "@/components/ActionButton";
import { BookCover } from "@/components/BookCover";
import { EmptyShelfIllustration } from "@/components/illustrations";

export async function InventoryManager() {
  const [books, categories] = await Promise.all([
    prisma.book.findMany({
      include: { category: true, tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Inventory"
        description="Add books, set categories and tags, and track copies."
      />

      <SectionCard title="Add a new book" icon={Plus}>
        <SmartForm
          action={createBookAction}
          successMessage="Book added to inventory."
          resetOnSuccess
          className="grid gap-3 sm:grid-cols-2"
        >
          <input
            name="title"
            required
            placeholder="Title"
            className={inputStyles}
          />
          <input
            name="author"
            required
            placeholder="Author"
            className={inputStyles}
          />
          <input
            name="isbn"
            placeholder="ISBN (optional)"
            className={inputStyles}
          />
          <input
            name="category"
            list="category-options"
            placeholder="Category e.g. Action, Sci-Fi"
            className={inputStyles}
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
          <input
            name="tags"
            placeholder="Tags, comma separated e.g. Bestseller, Series"
            className={`${inputStyles} sm:col-span-2`}
          />
          <textarea
            name="description"
            placeholder="Short description (optional)"
            className={`${inputStyles} sm:col-span-2`}
            rows={2}
          />
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-300">Copies</label>
            <input
              name="totalCopies"
              type="number"
              min={1}
              defaultValue={1}
              className={`w-20 ${inputStylesBase}`}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-300">Cover color</label>
            <input
              name="coverColor"
              type="color"
              defaultValue="#6366f1"
              className="h-9 w-14 rounded-lg border border-white/15"
            />
          </div>
          <SubmitButton
            pendingLabel="Adding book..."
            className={`${buttonStyles.primary} justify-self-start sm:col-span-2`}
          >
            <Plus size={16} />
            Add book
          </SubmitButton>
        </SmartForm>
      </SectionCard>

      <TableCard>
        {(() => {
          const rows = books.map((book, index) => {
            const tags = (
              <div className="flex max-w-xs flex-wrap gap-1">
                {book.category && <Chip tone="accent">{book.category.name}</Chip>}
                {book.tags.map(({ tag }) => (
                  <Chip key={tag.id}>{tag.name}</Chip>
                ))}
              </div>
            );

            const copies = (
              <>
                <span className="font-medium">{book.availableCopies}</span>
                <span className="text-slate-500"> / {book.totalCopies}</span>
              </>
            );

            const editForm = (
              <details>
                <summary className="cursor-pointer text-sm font-medium text-blue-400">
                  Edit
                </summary>
                <SmartForm
                  action={updateBookAction}
                  successMessage="Book updated."
                  className="mt-2 flex max-w-xs flex-col gap-2"
                >
                  <input type="hidden" name="id" value={book.id} />
                  <input
                    name="title"
                    defaultValue={book.title}
                    className={inputStylesSm}
                  />
                  <input
                    name="author"
                    defaultValue={book.author}
                    className={inputStylesSm}
                  />
                  <input
                    name="isbn"
                    defaultValue={book.isbn ?? ""}
                    placeholder="ISBN"
                    className={inputStylesSm}
                  />
                  <input
                    name="category"
                    defaultValue={book.category?.name ?? ""}
                    list="category-options"
                    placeholder="Category"
                    className={inputStylesSm}
                  />
                  <input
                    name="tags"
                    defaultValue={book.tags.map((t) => t.tag.name).join(", ")}
                    placeholder="Tags, comma separated"
                    className={inputStylesSm}
                  />
                  <textarea
                    name="description"
                    defaultValue={book.description ?? ""}
                    rows={2}
                    className={inputStylesSm}
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400">Total copies</label>
                    <input
                      name="totalCopies"
                      type="number"
                      min={1}
                      defaultValue={book.totalCopies}
                      className={`w-16 ${inputStylesSm}`}
                    />
                    <input
                      name="coverColor"
                      type="color"
                      defaultValue={book.coverColor}
                      className="h-8 w-10 rounded-lg border border-white/15"
                    />
                  </div>
                  <SubmitButton
                    pendingLabel="Saving..."
                    className={`${buttonStyles.darkSm} self-start`}
                  >
                    Save changes
                  </SubmitButton>
                </SmartForm>
              </details>
            );

            const deleteAction = (
              <ActionButton
                action={deleteBookAction.bind(null, book.id)}
                confirmMessage={`Delete "${book.title}"? This can't be undone.`}
                successMessage="Book deleted."
                pendingLabel="Deleting..."
                className={buttonStyles.destructiveSm}
              >
                Delete
              </ActionButton>
            );

            const rowDelay = { animationDelay: `${Math.min(index, 12) * 45}ms` };

            return {
              key: book.id,
              tr: (
                <tr
                  key={book.id}
                  className="animate-fade-in-row hover:bg-white/5"
                  style={rowDelay}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <BookCover id={book.id} title={book.title} size="xs" />
                      <div>
                        <p className="font-medium text-slate-100">{book.title}</p>
                        <p className="text-xs text-slate-400">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{tags}</td>
                  <td className="px-4 py-3 text-slate-300">{copies}</td>
                  <td className="px-4 py-3">{editForm}</td>
                  <td className="px-4 py-3 text-right">{deleteAction}</td>
                </tr>
              ),
              card: (
                <MobileCard
                  key={book.id}
                  className="animate-fade-slide-up"
                  style={rowDelay}
                >
                  <div className="flex items-center gap-3">
                    <BookCover id={book.id} title={book.title} size="xs" />
                    <div>
                      <p className="font-medium text-slate-100">{book.title}</p>
                      <p className="text-xs text-slate-400">{book.author}</p>
                    </div>
                  </div>
                  <MobileCardRow label="Category / Tags">{tags}</MobileCardRow>
                  <MobileCardRow label="Copies">{copies}</MobileCardRow>
                  <div className="border-t border-white/10 pt-2">{editForm}</div>
                  <div className="flex justify-end pt-1">{deleteAction}</div>
                </MobileCard>
              ),
            };
          });

          return (
            <>
              <div className="hidden sm:block">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-white/[0.03] text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Book</th>
                      <th className="px-4 py-3">Category / Tags</th>
                      <th className="px-4 py-3">Copies</th>
                      <th className="px-4 py-3">Update</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {rows.map((row) => row.tr)}
                    {books.length === 0 && (
                      <TableEmptyRow colSpan={5}>
                        <EmptyShelfIllustration className="mx-auto mb-2 h-16 w-20" />
                        No books in inventory yet.
                      </TableEmptyRow>
                    )}
                  </tbody>
                </table>
              </div>
              <MobileCardList>
                {rows.map((row) => row.card)}
                {books.length === 0 && (
                  <MobileCardEmpty>
                    <EmptyShelfIllustration className="mx-auto mb-2 h-16 w-20" />
                    No books in inventory yet.
                  </MobileCardEmpty>
                )}
              </MobileCardList>
            </>
          );
        })()}
      </TableCard>
    </div>
  );
}
