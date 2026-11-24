# Aura Tool

Plugin local de personalização visual de perfil para Vencord no Windows.

## Instalação

1. Tenha um checkout do [Vencord](https://github.com/Vendicated/Vencord), com Git, Node.js e a versão de pnpm indicada no `package.json` do checkout.
2. Baixe e extraia o projeto. Execute `install.bat` para localizar o checkout, instalar o plugin e compilar.
3. Recarregue o Discord e ative **Aura Tool** em **Configurações → Vencord Settings → Plugins**.

Use `install.bat -VencordPath "D:\Projetos\Vencord"` se precisar selecionar a pasta. O argumento `-WhatIf` testa a detecção sem alterar arquivos. Use `-Inject` para abrir o instalador oficial do Vencord.

A fonte editável está em [`src`](src). O [pacote ZIP](AuraTool-source.zip) contém a fonte e o instalador. Os efeitos são locais ao cliente.
