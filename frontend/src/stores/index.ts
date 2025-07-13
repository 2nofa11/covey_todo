import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'

const pinia = createPinia()
pinia.use(PiniaColada)

export default pinia