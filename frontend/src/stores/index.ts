import { PiniaColada } from '@pinia/colada'
import { createPinia } from 'pinia'

const pinia = createPinia()
pinia.use(PiniaColada)

export default pinia
