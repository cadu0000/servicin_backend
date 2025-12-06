# Backlog de Tarefas de Engenharia - Serviçin

Este documento contém as tarefas técnicas necessárias para concluir o desenvolvimento do sistema, cobrindo todas as lacunas identificadas no `implementation_status.md`.

---

## 1. Autenticação e Gestão de Conta

### [AUTH-01] Implementar Endpoint de Logout (RF04 / RN08)

**Objetivo:** Permitir que o usuário encerre sua sessão de forma segura.
**Passo a Passo:**

1. [ ] Como JWT é stateless, implementar uma estratégia de invalidação no client-side (instruir remoção do cookie/storage).
2. [x] (Opcional/Melhoria) Criar endpoint `POST /auth/logout` que limpa o cookie `httpOnly` se estiver sendo usado.
3. [ ] Documentar que o logout no frontend deve descartar o token.

### [AUTH-02] Implementar Exclusão de Conta (RF05 / RN09 / RN10 / RN11)

**Objetivo:** Permitir que o usuário exclua permanentemente sua conta e dados associados.
**Passo a Passo:**

1. [x] Criar endpoint `DELETE /auth/me` (ou `/users/me`).
2. [x] No `AuthService`, implementar método `deleteAccount(userId)`.
3. [ ] Garantir que o `onDelete: Cascade` no Prisma schema esteja correto para remover Address, ProviderProfile, etc.
4. [] Verificar se agendamentos futuros precisam ser cancelados logicamente antes da exclusão física (ou se o cascade cuida disso).
5. [x] Disparar evento/log de confirmação de exclusão (RN10).

---

## 2. Serviços e Busca

### [SERV-01] Migrar Busca de Serviços de Mock para Banco (RF09 / RF10 / RF11 / RN18)

**Objetivo:** Substituir a busca em memória (`MOCK_SERVICES`) por consultas reais ao banco de dados com filtros.
**Passo a Passo:**

1. [ ] No `ServiceRepository`, refatorar `filterServices` para usar `prisma.service.findMany`.
2. [ ] Implementar filtro por string de busca (nome do serviço ou categoria/eixo) usando `contains` (case insensitive).
3. [ ] Implementar filtros dinâmicos no `where` clause: `minPrice`, `maxPrice`, `providerId`.
4. [ ] Remover dependência de `data/service.mock.ts`.

### [SERV-02] Adicionar Localização ao Serviço (RF07 / RN15)

**Objetivo:** Permitir definir onde o serviço é prestado, em vez de depender apenas do endereço do usuário.
**Passo a Passo:**

1. [ ] Atualizar `schema.prisma`: Adicionar campo `location String?` (ou relação com Address) no model `Service` ou usar o endereço do `ServiceProvider` explicitamente.
2. [ ] Rodar migration do Prisma.
3. [ ] Atualizar `CreateServiceSchemaDTO` para aceitar o campo de localização.
4. [ ] Atualizar `ServiceService.create` para salvar esse dado.

### [SERV-03] Cadastro de Eixos/Categorias (RF12 / RN12 / RN13 / RN14)

**Objetivo:** Permitir que prestadores cadastrem novos tipos de serviço (Categorias).
**Passo a Passo:**

1. [ ] Criar `CategoryService.create` e `CategoryRepository.create`.
2. [ ] Criar endpoint `POST /categories` no `CategoryController`.
3. [ ] Validar se o nome da categoria já existe (RN14).
4. [ ] Garantir que apenas usuários autenticados (ou especificamente prestadores) possam chamar essa rota.

---

## 3. Agenda e Agendamentos

### [AGEN-01] Validar Conflito de Horários (RF14 / RN19)

**Objetivo:** Impedir agendamentos sobrepostos e mostrar a disponibilidade real na agenda.
**Passo a Passo:**

1. [ ] No `ServiceProviderService.findById`, ao gerar os slots de horário, consultar também a tabela `Appointment`.
2. [ ] Filtrar slots gerados: remover horários que colidam com agendamentos com status `PENDING`, `APPROVED` ou `CONFIRMED`.
3. [ ] No `AppointmentService.create`, adicionar verificação de "double booking": checar se já existe agendamento naquele horário para aquele prestador antes de criar.

### [AGEN-02] Configurar Aceite Automático vs Manual (RF17 / RN23)

**Objetivo:** Permitir que o prestador escolha se aceita agendamentos automaticamente.
**Passo a Passo:**

1. [ ] Adicionar campo `autoAcceptAppointments Boolean @default(false)` no model `ServiceProvider`.
2. [ ] Atualizar rotas de update do perfil do prestador para alternar essa config.
3. [ ] No `AppointmentService.create`:
   - Se `provider.autoAcceptAppointments == true`, criar com status `APPROVED`.
   - Se `false`, criar com status `PENDING`.
4. [ ] (Backlog Futuro) Criar cron job para cancelar `PENDING` com mais de 12h (RN23).

### [AGEN-03] Motivo de Cancelamento (RF24 / RN29)

**Objetivo:** Exigir justificativa ao cancelar um serviço.
**Passo a Passo:**

1. [ ] Adicionar campo `cancellationReason String?` no model `Appointment`.
2. [ ] Atualizar `updateAppointmentStatus` para receber um DTO contendo `status` e opcionalmente `reason`.
3. [ ] Se `status == CANCELED`, validar que `reason` foi fornecido e não é vazio.

---

## 4. Pagamentos e Finalização

### [PAY-01] Fluxo de Finalização e Pagamento (RF19 / RF20 / RF21 / RF23)

**Objetivo:** Gerenciar o ciclo de vida após o serviço ser feito.
**Passo a Passo:**

1. [ ] Criar endpoints específicos para transição de estados de pagamento, ex: `PATCH /appointments/:id/complete-service` (marca como Feito).
2. [ ] Criar endpoint `PATCH /appointments/:id/confirm-payment` (marca como Pago).
3. [ ] Implementar regra: Só permitir marcar como "Pago" se status for "Feito" (exceto pagamentos antecipados, verificar regra RN32).
4. [ ] Se pagamento for "Espécie", exigir que a ação venha do Prestador (RF21).

---

## 5. Avaliações

### [REV-01] Sistema de Avaliações (RF25 / RN02 / RN31 / RN32)

**Objetivo:** Permitir que solicitadores avaliem serviços concluídos.
**Passo a Passo:**

1. [ ] Criar `ReviewController`, `ReviewService`, `ReviewRepository`.
2. [ ] Criar endpoint `POST /reviews`.
3. [ ] Validar regras antes de criar:
   - O agendamento existe?
   - Status é `COMPLETED` (Feito) E `PAID` (Pago) (RN32)?
   - O usuário logado é o cliente deste agendamento?
4. [ ] Atualizar `averageRating` do Prestador após cada nova avaliação (trigger ou cálculo na aplicação).

---

## 6. Notificações e Link de Contato

### [NOTIF-01] Preferência de Contato (RF13 / RN17)

**Objetivo:** Ocultar WhatsApp se o prestador desejar.
**Passo a Passo:**

1. [ ] Adicionar campo `showContactInfo Boolean @default(true)` no model `ServiceProvider`.
2. [ ] No endpoint `GET /service-providers/:id`, verificar essa flag.
3. [ ] Se `false`, não retornar o array de contatos ou filtrar contatos do tipo PHONE/WHATSAPP.

### [NOTIF-02] Estrutura Básica de Notificações (RF18 / RN24)

**Objetivo:** Notificar usuários sobre mudanças de status.
**Passo a Passo:**

1. [ ] Definir estratégia (Email simples ou Tabela de Notificações no banco para polling).
2. [ ] Se tabela: Criar model `Notification`.
3. [ ] Criar service `NotificationService.notify(userId, message)`.
4. [ ] Injetar chamadas ao `NotificationService` nos métodos de `updateStatus` do agendamento.
