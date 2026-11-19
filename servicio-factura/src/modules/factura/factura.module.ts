import { Module } from '@nestjs/common';
import { FacturaController } from './factura.controller.js';
import { FacturaService } from './factura.service.js';
import { ProductoClienteService } from '../../services/producto-cliente.service.js';

@Module({
  controllers: [FacturaController],
  providers: [FacturaService, ProductoClienteService]
})
export class FacturaModule {}
