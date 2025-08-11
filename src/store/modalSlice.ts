import { createSlice } from '@reduxjs/toolkit'

interface ModalState {
  isOpen: boolean
}

const initialState: ModalState = {
  isOpen: false,
}

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state) => {
      state.isOpen = true
      console.log('changed')
    },
    closeModal: (state) => {
      state.isOpen = false
      console.log('changed new')
    },
  },
})


export const { openModal, closeModal } = modalSlice.actions
export default modalSlice.reducer
