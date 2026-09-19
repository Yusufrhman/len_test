import { createBrowserRouter } from "react-router-dom";
import { CreateEntityPage } from "@/features/entity/pages/CreateEntityPage";
import { EditEntityPage } from "@/features/entity/pages/EditEntityPage";
import { EntityPage } from "@/features/entity/pages/EntityPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <EntityPage />,
  },
  {
    path: "/entities/new",
    element: <CreateEntityPage />,
  },
  {
    path: "/entities/:id/edit",
    element: <EditEntityPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
