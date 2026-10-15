/**
 * O retorno das ações da família: o que deu certo e o que não deu.
 *
 * O aviso fica sempre no DOM (região viva que só aparece depois não é
 * anunciada), escondido só da vista quando vazio. O erro entra como `alert`,
 * que é anunciado ao aparecer, e segue o visual dos formulários de entrar:
 * tinta normal sobre fundo elevado, porque o vermelho é só para apagar dados.
 */
export function Recados({ aviso, erro }: { aviso: string; erro: string }) {
  return (
    <>
      <p role="status" className={aviso ? "text-sm text-success" : "sr-only"}>
        {aviso}
      </p>
      {erro && (
        <p
          role="alert"
          className="rounded-ds-fine border border-hairline bg-elevated px-3 py-2.5 text-sm leading-relaxed text-ink"
        >
          {erro}
        </p>
      )}
    </>
  )
}
