import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateTaskModal } from "../components/CreateTaskModal";

afterEach(cleanup);

describe("CreateTaskModal", () => {
  it("submits the task fields selected by the user", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(
      <CreateTaskModal
        onClose={vi.fn()}
        onCreate={onCreate}
        statuses={[
          {
            id: "status-todo",
            name: "To Do",
            category: "todo",
            color: "#64748b",
            position: 0,
          },
        ]}
        users={[
          {
            id: "user-bob",
            name: "Bob Smith",
            email: "bob@example.com",
            role: "member",
          },
        ]}
      />,
    );

    await user.type(
      screen.getByPlaceholderText("What needs to be done?"),
      "Document permissions",
    );
    const description = "A";
    await user.type(
      screen.getByPlaceholderText("Add context for your team..."),
      description,
    );
    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[1], "urgent");
    await user.click(screen.getByRole("button", { name: "Assignees" }));
    await user.click(screen.getByRole("option", { name: "Bob Smith" }));
    fireEvent.change(screen.getByLabelText("Due date"), {
      target: { value: "2026-10-29" },
    });
    await user.click(screen.getByRole("button", { name: "Create task" }));

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Document permissions",
        description,
        statusId: "status-todo",
        priority: "urgent",
        assigneeIds: ["user-bob"],
        dueDate: "2026-10-29",
      }),
    );
  });

  it("requires only a title and status", async () => {
    const user = userEvent.setup();
    render(
      <CreateTaskModal
        onClose={vi.fn()}
        onCreate={vi.fn()}
        statuses={[
          {
            id: "status-todo",
            name: "To Do",
            category: "todo",
            color: "#64748b",
            position: 0,
          },
        ]}
        users={[]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Create task" }));

    expect(screen.getByText("Title is required.")).toBeTruthy();
    expect(screen.queryByText("Description is required.")).toBeNull();
    expect(screen.queryByText("Due date is required.")).toBeNull();
  });

  it("creates a To Do task when statuses load after the modal opens", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    const statuses = [
      {
        id: "status-todo",
        name: "To Do",
        category: "todo" as const,
        color: "#64748b",
        position: 0,
      },
    ];
    const { rerender } = render(
      <CreateTaskModal
        onClose={vi.fn()}
        onCreate={onCreate}
        statuses={[]}
        users={[]}
      />,
    );

    rerender(
      <CreateTaskModal
        onClose={vi.fn()}
        onCreate={onCreate}
        statuses={statuses}
        users={[]}
      />,
    );
    await user.type(
      screen.getByPlaceholderText("What needs to be done?"),
      "To Do task",
    );
    await user.click(screen.getByRole("button", { name: "Create task" }));

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "To Do task",
        statusId: "status-todo",
      }),
    );
  });
});
