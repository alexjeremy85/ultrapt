import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const metadata = {
  title: "Termos de Uso — UltraPT",
};

export default async function TermosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed text-ink">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Termos de Uso e Contrato de Prestação de Serviços</h1>
      </div>

      <p className="mb-6 text-ink-muted">
        Versão de 01/05/2026. Aceite eletrônico realizado no momento do cadastro.
      </p>

      <div className="space-y-6">
        <section>
          <h2 className="mb-2 text-base font-semibold">Qualificação das Partes</h2>
          <p>
            <strong>CONTRATADO:</strong> Alex Guimarães Dos Santos, brasileiro, inscrito no CPF
            sob o nº 075.316.036-67, titular e responsável pela plataforma UltraPT, doravante
            denominado simplesmente &quot;ULTRAPT&quot;.
          </p>
          <p className="mt-2">
            <strong>CONTRATANTE:</strong> o(a) profissional de Educação Física que aderir aos
            presentes Termos por meio do cadastro e do aceite eletrônico no sítio ultrapt.com,
            qualificado(a) pelos dados informados no momento do cadastro, doravante denominado(a)
            simplesmente &quot;PERSONAL TRAINER&quot;.
          </p>
          <p className="mt-2">
            ULTRAPT e PERSONAL TRAINER são, em conjunto, denominados &quot;Partes&quot; e,
            individualmente, &quot;Parte&quot;. A presente contratação se dá entre pessoas físicas,
            em ambiente eletrônico, com aceite expresso destes Termos no ato do cadastro, valendo
            o referido aceite como manifestação de vontade plenamente válida e eficaz, nos termos
            do art. 10, § 2º, da MP 2.200-2/2001.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 1ª — Do Objeto</h2>
          <p>
            1.1. Este Contrato tem por objeto a concessão, pelo ULTRAPT ao PERSONAL TRAINER, do
            direito não exclusivo, não transferível e revogável de acesso e uso, em modalidade de
            software como serviço (SaaS), da plataforma ULTRAPT, acessível em ultrapt.com.
          </p>
          <p className="mt-2">1.2. A plataforma compreende, na presente data, as seguintes funcionalidades:</p>
          <ul className="ml-5 mt-1 list-disc space-y-1">
            <li>página pública personalizada do PERSONAL TRAINER no formato ultrapt.com/pt/{`{slug}`}, com templates configuráveis, biografia, número de CREF, especialidades, descrição de serviços, depoimentos, contatos e botão direto para WhatsApp;</li>
            <li>formulário público de captação de leads e questionário público de anamnese;</li>
            <li>módulo de gestão de alunos, com cadastro individual, login por código de acesso, visualização em cards, indicação de mensagens não lidas e tela de detalhe por aluno;</li>
            <li>construtor de treinos por blocos, com configuração de séries, repetições, carga, descanso, cadência e observações, biblioteca de exercícios pré-cadastrados com vídeos demonstrativos e templates de treino prontos;</li>
            <li>geração de PDF do treino em formato A4 paisagem, executada no lado do cliente;</li>
            <li>chat em tempo real entre PERSONAL TRAINER e seus alunos cadastrados;</li>
            <li>integração com gateway de pagamento Asaas para cobrança recorrente da assinatura;</li>
            <li>painel inicial (dashboard) orientado a tarefas pendentes.</li>
          </ul>
          <p className="mt-2">
            1.3. O ULTRAPT poderá, a seu critério e mediante comunicação prévia ao PERSONAL
            TRAINER, incluir, alterar ou descontinuar funcionalidades, observado o disposto na
            Cláusula 9.5.
          </p>
          <p className="mt-2">
            1.4. A plataforma é disponibilizada por meio de navegador web, sendo responsiva e
            otimizada para uso em smartphones e tablets. O ULTRAPT não disponibiliza, na presente
            data, aplicativo nativo para iOS ou Android, e não está obrigado a fazê-lo.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 2ª — Das Definições</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li><strong>Plataforma:</strong> o software ULTRAPT em sua totalidade, incluindo código-fonte, interface, banco de dados estrutural, biblioteca de exercícios, templates de treino, identidade visual e marca;</li>
            <li><strong>Conta:</strong> ambiente individualizado de acesso do PERSONAL TRAINER à Plataforma, vinculado a credenciais únicas;</li>
            <li><strong>Aluno:</strong> pessoa natural cadastrada pelo PERSONAL TRAINER na Plataforma, na qualidade de seu cliente final;</li>
            <li><strong>Lead:</strong> pessoa natural que preenche o formulário público de captação ou a anamnese pública vinculada à página do PERSONAL TRAINER;</li>
            <li><strong>Período de Avaliação ou Trial:</strong> prazo de fruição gratuita da Plataforma, conforme Cláusula 4ª;</li>
            <li><strong>Founder&apos;s Tier:</strong> oferta promocional de adesão antecipada, conforme Cláusula 7ª;</li>
            <li><strong>Asaas:</strong> prestador terceiro responsável pelo processamento dos pagamentos.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 3ª — Do Prazo e da Vigência</h2>
          <p>3.1. Este Contrato vigorará por prazo indeterminado, iniciando-se na data do aceite eletrônico pelo PERSONAL TRAINER e perdurando enquanto houver assinatura ativa e adimplente.</p>
          <p className="mt-2">3.2. A vigência poderá ser rescindida por qualquer das Partes, a qualquer tempo, observadas as condições da Cláusula 15ª.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 4ª — Do Período de Avaliação</h2>
          <p>4.1. É concedido ao PERSONAL TRAINER um Período de Avaliação gratuito de 14 (quatorze) dias corridos, contados a partir da data do cadastro, durante o qual o acesso às funcionalidades da Plataforma será integral, sem cobrança.</p>
          <p className="mt-2">4.2. O Período de Avaliação poderá ser estendido mediante aplicação de cupom de parceiro válido, fornecido pelo ULTRAPT a seu critério, observadas as seguintes condições: (i) os cupons não são cumulativos entre si; (ii) a extensão é vinculada ao cupom específico utilizado e não gera direito a renovação ou prorrogação adicional.</p>
          <p className="mt-2">4.3. Ao final do Período de Avaliação, não haverá cobrança automática. A continuidade do acesso depende de ação afirmativa do PERSONAL TRAINER, que deverá optar expressamente por um dos planos previstos na Cláusula 5ª.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 5ª — Do Preço e da Forma de Pagamento</h2>
          <p>5.1. O PERSONAL TRAINER poderá optar, ao final do Período de Avaliação ou a qualquer tempo, por um dos seguintes planos:</p>
          <p className="mt-2 ml-4">5.1.1. <strong>Plano Mensal:</strong> pelo valor de R$ 197,00 (cento e noventa e sete reais) por mês, em modalidade de assinatura recorrente, com renovação automática a cada ciclo mensal, sem prazo mínimo de fidelidade.</p>
          <p className="mt-1 ml-4">5.1.2. <strong>Plano Anual:</strong> pelo valor único de R$ 997,00 (novecentos e noventa e sete reais), correspondente a 12 (doze) meses de acesso, sem renovação automática.</p>
          <p className="mt-2">5.2. O pagamento será processado por meio do gateway Asaas, terceiro contratado para essa finalidade, podendo ser realizado por cartão de crédito, boleto bancário ou Pix, conforme os meios disponibilizados na ocasião.</p>
          <p className="mt-2">5.3. Os dados de pagamento (cartão de crédito, conta bancária ou equivalente) são coletados, processados e armazenados diretamente pelo Asaas, na qualidade de operador de pagamento, não sendo armazenados pelo ULTRAPT.</p>
          <p className="mt-2">5.4. O atraso superior a 5 (cinco) dias no pagamento de qualquer parcela acarretará, sem prejuízo de outras medidas, a suspensão do acesso à Plataforma, ressalvado o aviso prévio enviado por e-mail.</p>
          <p className="mt-2">5.5. Sobre os valores em atraso incidirão correção monetária pelo IPCA, juros de mora de 1% (um por cento) ao mês e multa moratória de 2% (dois por cento) sobre o valor devido.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 6ª — Do Reajuste</h2>
          <p>6.1. Os valores das mensalidades poderão ser reajustados anualmente, observada a periodicidade mínima legal, mediante a aplicação da variação acumulada do IPCA/IBGE no período, ou de outro índice oficial que vier a substituí-lo.</p>
          <p className="mt-2">6.2. Reajustes acima do índice oficial, decorrentes de reposicionamento comercial, serão comunicados ao PERSONAL TRAINER com antecedência mínima de 30 (trinta) dias, facultando-lhe o cancelamento sem ônus antes da entrada em vigor do novo preço.</p>
          <p className="mt-2">6.3. Fica desde já estabelecido reajuste programado do Plano Mensal de R$ 197,00 (cento e noventa e sete reais) para R$ 247,00 (duzentos e quarenta e sete reais), com data de vigência a ser oportunamente comunicada, ressalvada a hipótese da Cláusula 7ª.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 7ª — Do Founder&apos;s Tier</h2>
          <p>7.1. O ULTRAPT oferece, em caráter promocional e por prazo determinado, condição especial denominada &quot;Founder&apos;s Tier&quot;, limitada aos 20 (vinte) primeiros assinantes que aderirem por ordem cronológica de adesão.</p>
          <p className="mt-2">7.2. Constituem benefícios do Founder&apos;s Tier: (i) garantia de manutenção dos preços de R$ 197,00 mensais ou R$ 997,00 anuais, mesmo após eventual reajuste comercial referido na Cláusula 6.3, observado o reajuste anual de inflação; e (ii) acesso a canal direto com o fundador para envio de feedback de produto.</p>
          <p className="mt-2">7.3. A garantia de preço prevista neste tier vigora pelo prazo inicial de 12 (doze) meses, prorrogável automaticamente, em iguais e sucessivos períodos, enquanto o PERSONAL TRAINER mantiver assinatura ativa e adimplente.</p>
          <p className="mt-2">7.4. Perde-se o direito ao Founder&apos;s Tier nas seguintes hipóteses: (i) cancelamento da assinatura por período superior a 30 (trinta) dias consecutivos; ou (ii) inadimplemento não regularizado no prazo previsto na Cláusula 5.4.</p>
          <p className="mt-2">7.5. Eventual nova adesão posterior à perda do benefício ocorrerá ao preço vigente à época, sem reabertura do Founder&apos;s Tier.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 8ª — Do Acesso e das Credenciais</h2>
          <p>8.1. O acesso à Plataforma se dá mediante credenciais individuais (e-mail e senha) de uso pessoal e intransferível do PERSONAL TRAINER.</p>
          <p className="mt-2">8.2. É vedado o compartilhamento de credenciais com terceiros. O descumprimento autoriza o ULTRAPT a suspender ou rescindir o acesso, sem prejuízo de eventuais perdas e danos.</p>
          <p className="mt-2">8.3. Cabe exclusivamente ao PERSONAL TRAINER a guarda e a confidencialidade de suas credenciais, respondendo por todas as operações realizadas em sua Conta.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 9ª — Das Obrigações do ULTRAPT</h2>
          <p>9.1. Disponibilizar o acesso à Plataforma conforme as funcionalidades descritas na Cláusula 1.2, durante a vigência deste Contrato.</p>
          <p className="mt-2">9.2. Manter os dados do PERSONAL TRAINER e de seus Alunos em ambiente computacional com medidas razoáveis de segurança, observado o disposto na Cláusula 11ª, e realizar rotinas periódicas de backup.</p>
          <p className="mt-2">9.3. Disponibilizar canal de suporte técnico ao PERSONAL TRAINER, em horário comercial, por meio do e-mail oficial de suporte informado em ultrapt.com.</p>
          <p className="mt-2">9.4. Envidar esforços razoáveis para manter a Plataforma disponível, com nível de serviço alvo (SLA) de 99% (noventa e nove por cento) de uptime mensal, excluídos os períodos de manutenção programada e os eventos previstos na Cláusula 14ª.</p>
          <p className="mt-2">9.5. Comunicar ao PERSONAL TRAINER, com antecedência mínima de 30 (trinta) dias, eventuais reajustes de preço e mudanças significativas no produto que alterem materialmente as funcionalidades contratadas.</p>
          <p className="mt-2">9.6. Tratar os dados pessoais coletados em estrita observância à Lei nº 13.709/2018 (LGPD), conforme detalhado na Cláusula 11ª.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 10 — Das Obrigações do PERSONAL TRAINER</h2>
          <p>10.1. Fornecer, no cadastro e durante a vigência do Contrato, dados verídicos, completos e atualizados.</p>
          <p className="mt-2">10.2. Manter, durante toda a vigência do Contrato, registro ativo e regular junto ao Conselho Regional de Educação Física (CREF) competente, obrigando-se a comunicar imediatamente ao ULTRAPT qualquer suspensão, cancelamento ou impedimento profissional.</p>
          <p className="mt-2">10.3. Coletar, na qualidade de controlador dos dados pessoais de seus Alunos, o consentimento necessário e fornecer as informações exigidas pela LGPD para a inserção, tratamento e armazenamento de tais dados na Plataforma.</p>
          <p className="mt-2">10.4. Não utilizar a Plataforma para finalidades ilícitas, fraudulentas ou contrárias à boa-fé, à moral, aos bons costumes, ou aos direitos de terceiros.</p>
          <p className="mt-2">10.5. Não inserir, na Plataforma, conteúdos que: (i) violem direitos de propriedade intelectual de terceiros; (ii) contenham dados sensíveis de Alunos sem amparo legal; (iii) configurem prática de telemedicina, prescrição médica, prescrição nutricional ou de qualquer outra atividade privativa de profissional não autorizado.</p>
          <p className="mt-2">10.6. Manter os dados de pagamento atualizados e suficientes para a realização da cobrança recorrente.</p>
          <p className="mt-2">10.7. Não realizar engenharia reversa, descompilação, modificação não autorizada, raspagem automatizada de dados (scraping), ou qualquer tentativa de acesso não autorizado aos sistemas, código-fonte ou banco de dados do ULTRAPT.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 11 — Da Proteção de Dados Pessoais (LGPD)</h2>
          <p>11.1. As Partes obrigam-se a tratar os dados pessoais a que tiverem acesso em decorrência deste Contrato em estrita observância à Lei nº 13.709/2018 (LGPD), ao Marco Civil da Internet (Lei nº 12.965/2014) e à legislação correlata.</p>
          <p className="mt-2">11.2. Em relação aos dados pessoais do próprio PERSONAL TRAINER, o ULTRAPT atua como controlador, sendo a base legal de tratamento a execução do contrato e o legítimo interesse, conforme art. 7º, V e IX, da LGPD.</p>
          <p className="mt-2">11.3. Em relação aos dados pessoais dos Alunos (incluindo nome, e-mail, código de acesso, respostas de anamnese — que podem conter dados sensíveis de saúde, art. 5º, II, da LGPD —, treinos atribuídos e histórico de mensagens), o PERSONAL TRAINER atua como controlador, e o ULTRAPT atua como operador, nos termos do art. 5º, VI e VII, da LGPD.</p>
          <p className="mt-2">11.4. São obrigações do PERSONAL TRAINER, na qualidade de controlador dos dados de Alunos e Leads: (i) obter o consentimento ou identificar a base legal aplicável antes da inserção de dados na Plataforma, em especial quanto a dados sensíveis de saúde colhidos na anamnese; (ii) fornecer aos titulares as informações exigidas pelo art. 9º da LGPD; (iii) atender, no prazo legal, às requisições dos titulares; e (iv) comunicar ao ULTRAPT, por escrito e sem demora injustificada, qualquer requisição ou incidente que demande atuação do operador.</p>
          <p className="mt-2">11.5. São obrigações do ULTRAPT, na qualidade de operador: (i) tratar os dados unicamente conforme as instruções do PERSONAL TRAINER e as finalidades deste Contrato; (ii) adotar medidas técnicas e administrativas razoáveis para a proteção dos dados; (iii) manter registro das operações de tratamento; e (iv) comunicar ao PERSONAL TRAINER, sem demora injustificada, qualquer incidente de segurança envolvendo dados pessoais sob sua responsabilidade.</p>
          <p className="mt-2">11.6. São compartilhados com terceiros, no estrito necessário ao funcionamento da Plataforma: (i) Asaas, para processamento de pagamento; (ii) Supabase, para hospedagem dos dados e autenticação; e (iii) plataformas de incorporação de vídeo (YouTube), exclusivamente para exibição de vídeos demonstrativos de exercícios.</p>
          <p className="mt-2">11.7. O Encarregado pelo Tratamento de Dados Pessoais (DPO) do ULTRAPT, para os fins do art. 41 da LGPD, é o próprio Alex Guimarães Dos Santos (CPF 075.316.036-67), podendo ser contatado pelo e-mail oficial de suporte informado em ultrapt.com.</p>
          <p className="mt-2">11.8. Após a rescisão deste Contrato, o ULTRAPT manterá os dados do PERSONAL TRAINER e dos Alunos pelo prazo de 90 (noventa) dias para eventual reativação, findo o qual procederá à sua eliminação ou anonimização, ressalvadas as hipóteses legais de guarda obrigatória.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 12 — Da Propriedade Intelectual</h2>
          <p>12.1. São de propriedade exclusiva do ULTRAPT, ou de seus licenciantes, todos os direitos relativos à Plataforma, ao software subjacente, à marca, à identidade visual, ao layout, aos templates de página, aos templates de treino, à organização da biblioteca de exercícios e a qualquer outra criação intelectual integrada à Plataforma, sendo vedada qualquer reprodução, distribuição ou exploração comercial sem autorização expressa.</p>
          <p className="mt-2">12.2. São de propriedade do PERSONAL TRAINER os treinos por ele criados e personalizados, os textos e imagens próprios inseridos em sua página pública e os depoimentos coletados de seus Alunos, ficando o ULTRAPT autorizado a hospedá-los, exibi-los e processá-los na Plataforma, em caráter não exclusivo, enquanto a Conta estiver ativa.</p>
          <p className="mt-2">12.3. O ULTRAPT poderá utilizar, em material institucional e de marketing, o nome e a logomarca do PERSONAL TRAINER para indicação de uso da Plataforma, salvo manifestação em contrário do PERSONAL TRAINER, encaminhada por escrito.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 13 — Da Responsabilidade Técnica pelos Treinos</h2>
          <p>13.1. O ULTRAPT é prestador de serviço de tecnologia. Não exerce, em qualquer hipótese, atividade de prescrição de exercícios físicos, atividade de profissional de Educação Física, atividade médica, fisioterapêutica ou nutricional.</p>
          <p className="mt-2">13.2. A responsabilidade técnica integral pelos treinos prescritos, pela avaliação dos Alunos, pela leitura e interpretação das anamneses, pela adequação das cargas e pela observância das recomendações do CONFEF/CREF é exclusiva do PERSONAL TRAINER, na qualidade de profissional registrado no respectivo conselho.</p>
          <p className="mt-2">13.3. Eventuais lesões, agravamentos de saúde, intercorrências físicas ou quaisquer danos sofridos por Alunos em decorrência da execução de treinos prescritos por meio da Plataforma são de responsabilidade exclusiva do PERSONAL TRAINER.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 14 — Das Limitações de Responsabilidade</h2>
          <p>14.1. Sem prejuízo das normas cogentes de proteção ao consumidor, quando aplicáveis, o ULTRAPT não responderá por:</p>
          <ul className="ml-5 mt-1 list-disc space-y-1">
            <li>indisponibilidades programadas e previamente comunicadas para fins de manutenção;</li>
            <li>indisponibilidades, falhas ou interrupções decorrentes de prestadores terceiros, em especial Supabase, Asaas e provedores de hospedagem ou de telecomunicação;</li>
            <li>eventos de caso fortuito, força maior ou fato do príncipe, conforme art. 393 do Código Civil;</li>
            <li>conteúdo dos treinos prescritos pelo PERSONAL TRAINER;</li>
            <li>conteúdo das mensagens trocadas entre o PERSONAL TRAINER e seus Alunos;</li>
            <li>acurácia das informações prestadas pelos Alunos na anamnese;</li>
            <li>uso indevido das credenciais de acesso pelo PERSONAL TRAINER ou por terceiros a quem este as tenha confiado, ainda que sem autorização.</li>
          </ul>
          <p className="mt-2">14.2. Em qualquer hipótese, e ressalvada a aplicação cogente do CDC, a responsabilidade total do ULTRAPT, em conjunto, por eventos relacionados a este Contrato, fica limitada ao valor efetivamente pago pelo PERSONAL TRAINER nos 12 (doze) meses anteriores ao evento que der causa ao pleito.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 15 — Do Cancelamento e do Reembolso</h2>
          <p>15.1. O cancelamento da assinatura poderá ser solicitado pelo PERSONAL TRAINER, a qualquer tempo, diretamente pelo painel da Plataforma, sem multa e sem fidelidade.</p>
          <p className="mt-2">15.2. No Plano Mensal, o cancelamento produz efeitos ao fim do ciclo mensal já pago, durante o qual o acesso permanece disponível. Não há reembolso de mensalidade já cobrada e usufruída, total ou parcialmente.</p>
          <p className="mt-2">15.3. No Plano Anual, observa-se o seguinte regime de reembolso:</p>
          <p className="mt-1 ml-4">15.3.1. Caso o pedido de cancelamento seja apresentado em até 7 (sete) dias corridos, contados da data do pagamento, o PERSONAL TRAINER fará jus à devolução integral do valor pago, nos termos do art. 49 do Código de Defesa do Consumidor (Lei nº 8.078/1990).</p>
          <p className="mt-1 ml-4">15.3.2. Após o prazo previsto na Cláusula 15.3.1, o PERSONAL TRAINER terá direito ao reembolso proporcional dos meses não usufruídos, descontada a fração equivalente ao desconto comercial concedido frente ao Plano Mensal.</p>
          <p className="mt-2">15.4. Durante o Período de Avaliação, o cancelamento produz efeitos imediatos, sem cobrança.</p>
          <p className="mt-2">15.5. O ULTRAPT poderá rescindir este Contrato, mediante notificação prévia de 30 (trinta) dias, em caso de descontinuidade do produto, restituindo, neste caso, os valores correspondentes aos meses não usufruídos do Plano Anual, se houver.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 16 — Da Suspensão e da Rescisão por Inadimplemento ou Justa Causa</h2>
          <p>16.1. O ULTRAPT poderá suspender, total ou parcialmente, o acesso à Plataforma, ou rescindir este Contrato, independentemente de aviso prévio, nas seguintes hipóteses:</p>
          <ul className="ml-5 mt-1 list-disc space-y-1">
            <li>inadimplemento de qualquer obrigação pecuniária por mais de 5 (cinco) dias após a notificação por e-mail;</li>
            <li>uso da Plataforma para finalidade ilícita, fraudulenta ou contrária a este Contrato;</li>
            <li>perda, suspensão ou cancelamento do registro CREF do PERSONAL TRAINER;</li>
            <li>violação de direito de propriedade intelectual ou de privacidade de terceiros;</li>
            <li>ordem judicial ou administrativa que determine a suspensão.</li>
          </ul>
          <p className="mt-2">16.2. Em caso de rescisão por justa causa imputável ao PERSONAL TRAINER, não haverá direito a reembolso de valores já pagos.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 17 — Da Confidencialidade</h2>
          <p>17.1. As Partes obrigam-se a manter sigilo sobre todas as informações confidenciais a que tiverem acesso em razão deste Contrato, abstendo-se de divulgá-las a terceiros sem autorização expressa, ressalvadas as hipóteses de obrigação legal ou ordem judicial.</p>
          <p className="mt-2">17.2. A obrigação de confidencialidade subsiste pelo prazo de 5 (cinco) anos contados do término do Contrato.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 18 — Das Comunicações</h2>
          <p>18.1. Toda comunicação prevista neste Contrato será considerada válida quando enviada para o e-mail cadastrado pelo PERSONAL TRAINER em sua Conta, ou para o e-mail oficial de suporte do ULTRAPT.</p>
          <p className="mt-2">18.2. Cabe a cada Parte manter seus dados de contato atualizados, sob pena de reputarem-se válidas as comunicações enviadas aos endereços anteriormente informados.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 19 — Das Disposições Gerais</h2>
          <p>19.1. Este Contrato representa o acordo integral entre as Partes quanto ao seu objeto, prevalecendo sobre quaisquer entendimentos, propostas ou comunicações anteriores, verbais ou escritas.</p>
          <p className="mt-2">19.2. A tolerância de qualquer das Partes quanto ao descumprimento de obrigação aqui prevista não implicará renovação, novação ou renúncia ao direito de exigir o cumprimento futuro.</p>
          <p className="mt-2">19.3. A eventual nulidade ou inexequibilidade de qualquer cláusula deste Contrato não afetará a validade das demais, que permanecerão em pleno vigor.</p>
          <p className="mt-2">19.4. Este Contrato é celebrado em caráter não exclusivo, podendo qualquer das Partes prestar ou contratar serviços similares com terceiros.</p>
          <p className="mt-2">19.5. A cessão deste Contrato pelo PERSONAL TRAINER depende de prévia e expressa autorização do ULTRAPT. O ULTRAPT poderá ceder este Contrato em decorrência de operação societária ou constituição de pessoa jurídica para continuidade da operação, mediante simples comunicação ao PERSONAL TRAINER.</p>
          <p className="mt-2">19.6. O aceite eletrônico destes Termos, no momento do cadastro, vale como assinatura para todos os fins de direito, nos termos da MP 2.200-2/2001 e da legislação aplicável.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold">Cláusula 20 — Do Foro</h2>
          <p>20.1. Fica eleito o Foro da Comarca de domicílio do PERSONAL TRAINER para dirimir quaisquer controvérsias oriundas deste Contrato, em observância ao art. 101, I, do Código de Defesa do Consumidor, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
        </section>

        <section className="border-t border-border pt-4 text-ink-muted">
          <p>E, por estarem assim justas e contratadas, as Partes manifestam sua concordância com o presente Contrato por meio do aceite eletrônico realizado no momento do cadastro na Plataforma, valendo tal aceite como manifestação plena de vontade.</p>
          <p className="mt-3"><strong>ULTRAPT</strong> — Alex Guimarães Dos Santos — CPF 075.316.036-67</p>
          <p className="mt-1"><strong>PERSONAL TRAINER</strong> — aceite eletrônico realizado no cadastro</p>
        </section>
      </div>

      <div className="mt-10 border-t border-border pt-6 text-center">
        <Link href="/signup" className="btn-primary">
          Voltar ao cadastro
        </Link>
      </div>
    </div>
  );
}
