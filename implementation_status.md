# Status de Implementação do Serviçin

Este documento detalha o estado atual do desenvolvimento do sistema Serviçin, comparando o código existente com o `requirements.md`.

## 1. Requisitos Funcionais (RF)

### ✅ Já Implementado

| ID       | Descrição (Resumo)          | Justificativa / Referência no Código                                                                                                                                                         | Status                                 |
| :------- | :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| **RF01** | Cadastro de Prestadores     | Implementado em `AuthService.signup` (chama `signupIndividual` ou `signupCompany`) e `ServiceProviderService.create`. Valida CPF/CNPJ único. <br> `src/services/auth.service.ts`             | Completo                               |
| **RF02** | Cadastro de Solicitadores   | Implementado em `AuthService.signup` (`signupIndividual`). Valida CPF único. <br> `src/services/auth.service.ts`                                                                             | Completo                               |
| **RF03** | Login de Usuários           | Implementado em `AuthService.login`. Utiliza JWT e valida senha (hash). <br> `src/services/auth.service.ts`                                                                                  | Completo                               |
| **RF04** | Logout                      | Implementado endpoint `POST /auth/logout` que invalida cookie httpOnly. <br> `src/api/controllers/auth.controller.ts`                                                                        | Completo                               |
| **RF06** | Unicidade de CPF/CNPJ       | Verificações `findIndividualByCPF` e `findCompanyByCNPJ` existem no fluxo de cadastro. <br> `src/services/auth.service.ts`                                                                   | Completo                               |
| **RF07** | Cadastrar Serviço           | Implementado em `ServiceService.create`. <br> **Obs:** O campo "Localização de Atendimento" não consta no model `Service` (apenas `Address` no User). <br> `src/services/service.service.ts` | Parcial (Falta localização no Serviço) |
| **RF08** | Associar múltiplos serviços | Tabela `provider_services` (N:N) implementada e populada na criação do serviço. <br> `src/repository/service.repository.ts`                                                                  | Completo                               |
| **RF15** | Agendar serviços            | Endpoint de criação de agendamento existe (`AppointmentService.create`). Validações básicas (não agendar domingo, não agendar para si mesmo). <br> `src/services/appointment.service.ts`     | Completo (Básico)                      |
| **RF22** | Status de serviço           | Enum `AppointmentStatus` existe e atualização de status permitida via `updateAppointmentStatus`. <br> `src/services/appointment.service.ts`                                                  | Parcial (Lógica de fluxo incompleta)   |
| **RF24** | Cancelamento de serviço     | Permite setar status `CANCELED`. <br> `src/services/appointment.service.ts`                                                                                                                  | Parcial (Falta motivo obrigatório)     |

### 🚧 Pendente / A Fazer

| ID       | Descrição (Resumo)               | O que falta fazer                                                                                                                                                                      | Prioridade |
| :------- | :------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| **RF05** | Excluir conta                    | Não há endpoint ou serviço para exclusão de usuários (`DELETE /users/:id`).                                                                                                            | Alta       |
| **RF09** | Busca por serviços               | A busca existe em `ServiceRepository.filterServices`, mas **utiliza dados MOCK** (`MOCK_SERVICES`). Precisa ser migrada para consulta real no Banco.                                   | Alta       |
| **RF10** | Filtros de busca                 | Mesma situação do RF09. A lógica está implementada sobre um array em memória (Mock), não no banco.                                                                                     | Alta       |
| **RF11** | Lista de resultados              | Depende da implementação real do RF09/RF10.                                                                                                                                            | Alta       |
| **RF12** | Cadastrar Eixo (Categoria)       | `CategoryService` possui apenas métodos de leitura (`getAll`, `getById`). Falta método de criação.                                                                                     | Alta       |
| **RF13** | Link WhatsApp (Público/Privado)  | `Contact` existe, mas não há lógica para "ocultar" contato baseado em preferência do prestador no retorno da API.                                                                      | Média      |
| **RF14** | Agenda do Prestador              | `ServiceProviderService.findById` gera slots de horário, mas **não verifica a tabela `appointments`** para remover horários já ocupados. A agenda mostrada é sempre a "ideal" (vazia). | Média      |
| **RF17** | Configurar Aceite (Auto/Manual)  | Não há campo no banco ou lógica para diferenciar aceite automático ou manual na criação do agendamento. Todo agendamento nasce como `PENDING`.                                         | Alta       |
| **RF18** | Alertas de confirmação           | Não há sistema de notificações ou envio de emails implementado.                                                                                                                        | Alta       |
| **RF19** | Notificação de Pagamento         | Lógica de transição de "Feito" -> "Pagamento em aberto" e notificação não existe.                                                                                                      | Alta       |
| **RF20** | Gerenciar Pagamentos             | Não há lógica de processamento de pagamentos ou tabela de transações detalhada além do `paymentMethod` no agendamento. Status "Pago" é apenas um enum, sem fluxo.                      | Alta       |
| **RF21** | Confirmação Pagamento em Espécie | Sem lógica específica implementada.                                                                                                                                                    | Alta       |
| **RF23** | Status de Pagamento              | Tags existem como Enum, mas não há endpoints para gerenciar especificamente o ciclo de vida do pagamento separado do agendamento.                                                      | Alta       |
| **RF25** | Avaliação de Serviço             | Model `Review` existe no Prisma, mas não há `ReviewController` ou `ReviewService` para criar/listar avaliações.                                                                        | Alta       |

---

## 2. Regras de Negócio (RN)

### ✅ Já Implementado

| ID       | Regra                               | Justificativa / Referência                                                                                                                           |
| :------- | :---------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RN01** | Identificação por CPF/CNPJ          | Modelos `Individual` e `Company` exigem CPF/CNPJ únicos.                                                                                             |
| **RN03** | Classificação Prestador/Solicitador | Enum `UserRole` e tabelas separadas garantem a distinção.                                                                                            |
| **RN04** | Info Obrigatória Prestador          | Schema de validação (`signupUserSchema`) e DTOs garantem campos obrigatórios.                                                                        |
| **RN05** | CPF/CNPJ Único                      | Validado no `AuthService` antes da inserção.                                                                                                         |
| **RN06** | Login válido                        | `AuthService.login` verifica senha com hash.                                                                                                         |
| **RN07** | Nome de usuário único               | O sistema usa Email como identificador de login (único). Requisito fala "Nome de usuário", mas email atende tecnicamente a unicidade de login.       |
| **RN08** | Logout a qualquer momento           | Endpoint `/auth/logout` disponível.                                                                                                                  |
| **RN15** | Campos cadastro serviço             | Schema de validação `createServiceSchemaDTO` exige campos, exceto localização (que falta no modelo).                                                 |
| **RN16** | Múltiplos serviços                  | Relacionamento `ProviderService` (N:N) permite.                                                                                                      |
| **RN20** | Apenas solicitador agenda           | Validação em `AppointmentService.create` impede agendamento para si mesmo (prestador == cliente), mas idealmente deveria checar role do user logado. |
| **RN21** | Dados obrigatórios agendamento      | Schema `createAppointmentSchemaDTO` valida campos obrigatórios.                                                                                      |

### 🚧 Pendente / A Fazer

| ID             | Regra                                | O que falta                                                                                                                       |
| :------------- | :----------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **RN02**       | Avaliação recíproca                  | Sistema de avaliação não implementado.                                                                                            |
| **RN09/10/11** | Exclusão de conta                    | Funcionalidade de exclusão não implementada.                                                                                      |
| **RN12/13/14** | Cadastro de Eixos                    | Apenas prestadores podem cadastrar (falta endpoint e verificação de permissão).                                                   |
| **RN17**       | Link contato opcional                | Lógica de exibição condicional não implementada.                                                                                  |
| **RN18**       | Filtros de busca                     | Implementação atual é Mock.                                                                                                       |
| **RN19**       | Agenda visível com ocupação          | Falta cruzar disponibilidade com agendamentos existentes.                                                                         |
| **RN23**       | Aceite Manual (12h)                  | Não há job ou lógica para expirar agendamentos não aceitos em 12h.                                                                |
| **RN24**       | Notificações                         | Sistema inexistente.                                                                                                              |
| **RN27**       | Fluxo Feito -> Pagamento             | Automação de status não implementada.                                                                                             |
| **RN29**       | Motivo cancelamento                  | Campo `description` existe no agendamento (geral), mas não um campo específico para "motivo cancelamento" ao atualizar status.    |
| **RN30**       | Liberação de agenda pós-cancelamento | Como a agenda não considera agendamentos hoje (RN19), tecnicamente "funciona" por estar sempre livre, mas a lógica correta falta. |
| **RN32**       | Condição para avaliar                | Lógica de bloqueio de avaliação (Feito + Pago) não existe.                                                                        |
| **RN34**       | Confirmação Espécie                  | Fluxo de confirmação manual de pagamento não implementado.                                                                        |
