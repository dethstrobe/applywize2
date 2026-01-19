"use client"

import { deleteApplication } from "../pages/applications/functions"
import { Icon } from "./Icon"
import { Button } from "./ui/button"

interface props {
  applicationId: string
}

export const DeleteApplicationButton = ({ applicationId }: props) => (
  <Button
    variant="destructive"
    onClick={() => void deleteApplication(applicationId)}
  >
    <Icon id="check" />
    Yes, Delete It
  </Button>
)
