'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { closeModal } from '@/store/modalSlice'
import { RootState } from '@/store'
import { useEffect } from 'react'

export default function GlobalModal() {
  const dispatch = useDispatch()
  const isOpen = useSelector((state: RootState) => state.modal.isOpen)
  const router = useRouter()

  const handleClose = () => {
    dispatch(closeModal())
  }

  const handleRedirect = () => {
    handleClose()
    router.push('/user/billing')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>You are out of tokens</DialogTitle>
          <DialogDescription>
            Purchase more tokens to generate.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleRedirect}>
            Go to Billing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
