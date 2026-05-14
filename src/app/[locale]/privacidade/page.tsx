import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const metadata = {
  title: "Política de Privacidade — UltraPT",
};

export default async function PrivacidadePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed text-ink">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Política de Privacidade</h1>
      </div>

      <p className="mb-6 text-ink-muted">
        Versão de 14/05/2026. Esta política descreve como o UltraPT coleta, usa,
        compartilha e protege dados pessoais, em conformidade com a Lei Geral de
        Proteção de Dados (Lei nº 13.709/2018 — LGPD).
      </p>

      <div className="space-y-6">
        <section>
          <h2 className="mb-2 text-base font-semibold">1. Quem somos</h2>
          <p>
            <strong>UltraPT</strong> é uma plataforma SaaS operada por Alex
            Guimarães Dos Santos, CPF 075.316.036-67. Disponível em
            ultrapt.com.br.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">2. Papéis (controlador e operador)</h2>
          <p>
            <strong>2.1.</strong> Em relação aos dados pessoais do{" "}
            <strong>Personal Trainer</strong> (titular da conta), o UltraPT
            atua como <strong>controlador</strong>. Base legal: execução de
            contrato e legítimo interesse (Art. 7º, V e IX, LGPD).
          </p>
          <p className="mt-2">
            <strong>2.2.</strong> Em relação aos dados pessoais dos{" "}
            <strong>Alunos cadastrados pelo Personal Trainer</strong>{" "}
            (incluindo dados sensíveis de saúde da anamnese, Art. 5º, II,
            LGPD), o Personal Trainer atua como{" "}
            <strong>controlador</strong> e o UltraPT atua como{" "}
            <strong>operador</strong> (Art. 5º, VI e VII, LGPD), tratando os
            dados exclusivamente conforme instruções do Personal Trainer e as
            finalidades deste serviço.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">3. Dados coletados e finalidades</h2>

          <h3 className="mt-3 font-medium">3.1. Do Personal Trainer (titular)</h3>
          <ul className="ml-6 mt-1 list-disc space-y-1">
            <li>
              <strong>Nome, e-mail, senha (hash)</strong> — autenticação,
              comunicação operacional. Base: execução de contrato.
            </li>
            <li>
              <strong>CPF</strong> — emissão de cobranças via Asaas. Base:
              obrigação legal fiscal (Art. 7º, II).
            </li>
            <li>
              <strong>Foto, bio, CREF, redes sociais</strong> — exibição na
              página pública do PT (se preenchidos pelo próprio). Base:
              consentimento e execução de contrato.
            </li>
            <li>
              <strong>Histórico de pagamentos e plano</strong> — gestão da
              assinatura. Base: execução de contrato e obrigação legal fiscal.
            </li>
          </ul>

          <h3 className="mt-4 font-medium">3.2. Dos Alunos do Personal Trainer</h3>
          <ul className="ml-6 mt-1 list-disc space-y-1">
            <li>
              <strong>Nome, e-mail, telefone, data de nascimento, foto</strong>{" "}
              — identificação e contato. Controlador é o PT.
            </li>
            <li>
              <strong>Anamnese: dados sensíveis de saúde</strong> (condições
              médicas, lesões, medicações, peso, altura, gênero, hábitos
              alimentares e de sono) — prescrição segura de treino. Base:{" "}
              <strong>consentimento específico e destacado</strong> do aluno
              no momento do preenchimento (Art. 11, II "a", LGPD).
            </li>
            <li>
              <strong>Treinos atribuídos, execução de exercícios, mensagens
              de chat</strong> — funcionalidade do serviço.
            </li>
          </ul>

          <h3 className="mt-4 font-medium">3.3. Dados técnicos</h3>
          <ul className="ml-6 mt-1 list-disc space-y-1">
            <li>
              <strong>Logs de acesso</strong> (data/hora, endpoint, status
              HTTP, IP do provedor) — segurança, prevenção a fraude e
              diagnóstico. Base: legítimo interesse (Art. 7º, IX). Retidos por
              até 90 dias.
            </li>
            <li>
              <strong>Cookies essenciais</strong> (autenticação, idioma) —
              indispensáveis ao funcionamento. Não dependem de consentimento.
            </li>
            <li>
              <strong>Cookies de analytics e marketing</strong> — apenas se você
              autorizar no banner de cookies. Hoje o UltraPT não opera cookies
              de tracking; esta cláusula vigora preventivamente.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">4. Compartilhamento e subprocessadores</h2>
          <p>
            Pra operar o serviço, compartilhamos dados estritamente necessários
            com os seguintes operadores subcontratados:
          </p>
          <ul className="ml-6 mt-2 list-disc space-y-1">
            <li>
              <strong>Supabase Inc.</strong> (EUA) — banco de dados,
              autenticação, armazenamento de arquivos.
            </li>
            <li>
              <strong>Vercel Inc.</strong> (EUA) — hospedagem da aplicação,
              CDN, edge functions.
            </li>
            <li>
              <strong>Asaas Gestão Financeira S.A.</strong> (Brasil) —
              processamento de cobranças Pix.
            </li>
          </ul>
          <p className="mt-2">
            Lista atualizada nesta página. Adições serão comunicadas antes de
            entrarem em operação.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">5. Transferência internacional de dados</h2>
          <p>
            Os dados podem ser armazenados e processados em servidores fora do
            Brasil (principalmente Estados Unidos), em provedores que aderem a
            cláusulas contratuais padrão e oferecem nível de proteção adequado,
            nos termos do Art. 33 da LGPD.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">6. Retenção e exclusão</h2>
          <ul className="ml-6 mt-1 list-disc space-y-1">
            <li>
              <strong>Conta ativa:</strong> dados mantidos enquanto a
              assinatura existir.
            </li>
            <li>
              <strong>Após exclusão da conta:</strong> dados pessoais são{" "}
              <strong>anonimizados imediatamente</strong>. Apenas registros
              fiscais (pagamentos, identificadores Asaas) são retidos por{" "}
              <strong>5 anos</strong> em cumprimento ao Código Tributário
              Nacional.
            </li>
            <li>
              <strong>Backups:</strong> dados anonimizados também ficam em
              backups por até 30 dias adicionais, após o que são definitivamente
              destruídos.
            </li>
            <li>
              <strong>Logs técnicos:</strong> retidos por 90 dias.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">7. Seus direitos (Art. 18 LGPD)</h2>
          <p>O titular pode, a qualquer momento:</p>
          <ul className="ml-6 mt-2 list-disc space-y-1">
            <li>Confirmar a existência de tratamento</li>
            <li>
              <strong>Acessar e exportar</strong> seus dados (
              <Link href="/dashboard/profile" className="text-accent hover:underline">
                Perfil → Exportar dados
              </Link>
              )
            </li>
            <li>Corrigir dados incompletos ou desatualizados</li>
            <li>
              <strong>Excluir a conta</strong> e ter seus dados anonimizados (
              <Link href="/dashboard/profile" className="text-accent hover:underline">
                Perfil → Excluir minha conta
              </Link>
              )
            </li>
            <li>Revogar consentimento quando for a base legal</li>
            <li>Solicitar portabilidade dos dados</li>
            <li>Ser informado sobre compartilhamentos</li>
          </ul>
          <p className="mt-2">
            <strong>Alunos do Personal Trainer:</strong> devem exercer esses
            direitos diretamente com seu Personal Trainer, que é o controlador
            dos seus dados. O UltraPT, na qualidade de operador, dará suporte
            técnico ao atendimento da requisição.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">8. Segurança técnica</h2>
          <ul className="ml-6 mt-1 list-disc space-y-1">
            <li>Senhas armazenadas com hash bcrypt (Supabase Auth)</li>
            <li>
              Isolamento de dados por tenant via Row Level Security (PostgreSQL
              RLS)
            </li>
            <li>Conexões protegidas por TLS</li>
            <li>Buckets de arquivos com policies restritivas por proprietário</li>
            <li>Auditoria de código contínua e revisões de segurança</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">9. Incidentes de segurança</h2>
          <p>
            Em caso de incidente de segurança envolvendo dados pessoais com
            risco relevante aos titulares, o UltraPT comunicará a ANPD e os
            titulares afetados em prazo razoável, em até <strong>3 dias úteis</strong>{" "}
            da ciência do incidente, conforme orientação da ANPD.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">10. Cookies</h2>
          <p>
            <strong>Essenciais</strong> (autenticação, idioma): não exigem
            consentimento, pois são indispensáveis ao funcionamento do serviço.
          </p>
          <p className="mt-2">
            <strong>Analíticos e de marketing</strong>: caso sejam ativados
            futuramente, só serão carregados <em>após</em> aceite explícito no
            banner de cookies. O consentimento pode ser revogado a qualquer
            momento limpando as preferências do navegador ou solicitando ao
            encarregado.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">11. Inteligência artificial</h2>
          <p>
            O UltraPT atualmente não envia dados pessoais para serviços de
            inteligência artificial. Caso integre IA futuramente (ex: sugestão
            de treino), garantirá que:
          </p>
          <ul className="ml-6 mt-2 list-disc space-y-1">
            <li>
              Apenas dados estritamente necessários sejam enviados, com
              minimização e pseudonimização sempre que possível
            </li>
            <li>
              O fornecedor de IA esteja contratualmente proibido de usar os
              dados para treinar modelos próprios
            </li>
            <li>Esta política será atualizada antes da ativação</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">12. Encarregado de proteção de dados (DPO)</h2>
          <p>
            Para exercer direitos, esclarecer dúvidas ou reportar incidentes,
            contate o encarregado:
          </p>
          <p className="mt-2">
            <strong>Alex Guimarães Dos Santos</strong>
            <br />
            E-mail:{" "}
            <a
              href="mailto:privacidade@ultrapt.com.br"
              className="text-accent hover:underline"
            >
              privacidade@ultrapt.com.br
            </a>
          </p>
          <p className="mt-2">
            Resposta em até 15 dias da requisição (Art. 19, §1º, LGPD).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">13. Alterações</h2>
          <p>
            Esta política pode ser atualizada periodicamente. Mudanças
            relevantes serão notificadas com antecedência mínima de 30 dias por
            e-mail e/ou no painel.
          </p>
        </section>

        <p className="mt-8 text-xs text-ink-dim">
          Documento associado:{" "}
          <Link href="/termos" className="text-accent hover:underline">
            Termos de Uso
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
