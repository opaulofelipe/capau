# Tabuleiro Digital — Egito

Projeto front-end puro (HTML, CSS e JavaScript), sem bibliotecas externas.

## Estrutura atual

- Área lógica da interface: 1920×1080.
- O tabuleiro do Egito ocupa a metade esquerda: 960×1080.
- A metade direita permanece preta e reservada para futuras interfaces.
- O mapa possui 60 regiões, organizadas em 6 colunas × 10 linhas.
- Cada região recebe um número e um recurso sorteados no início da partida.
- Existem 45 pontos de construção, 76 trechos de estrada e 4 pontos exclusivos para Porto.

## Números

Os 60 números seguem uma distribuição baseada na probabilidade de dois dados de seis faces:

- 2: 2 vezes
- 3: 3 vezes
- 4: 5 vezes
- 5: 7 vezes
- 6: 8 vezes
- 7: 10 vezes
- 8: 8 vezes
- 9: 7 vezes
- 10: 5 vezes
- 11: 3 vezes
- 12: 2 vezes

Ao rolar os dois dados, as regiões que possuem o total obtido são destacadas.

## Recursos

Os quatro recursos são sorteados entre as 60 regiões:

- Alimento: 15
- Madeira: 15
- Pedra: 15
- Minério: 15

O recurso aparece dentro do quadrado da região junto com seu número.

## Controles

- Seleção entre seis cores de jogador.
- Construção nos pontos disponíveis.
- Estradas nos trechos pontilhados.
- Portos nos quatro pontos vermelhos.
- Rolagem de dois dados.
- Desfazer última alteração.
- Nova partida.
- Tela cheia/modo ampliado.
- Estado salvo automaticamente no `localStorage`.

Ao iniciar uma nova partida, construções e estradas são removidas e os 60 números e recursos são sorteados novamente.

## Publicação

O projeto é compatível com GitHub Pages e não requer servidor ou banco de dados.
