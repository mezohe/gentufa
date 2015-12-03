spagetufa
=========

spagetufa is a parser for Lojban incorporating many experimental changes. There is no documentation yet; the only way to find out what has changed is to read the commit log or to use it.


=== Requirements ===

For generating a PEGJS grammar engine from its PEG grammar file, as well as for running the IRC bot interfaces, you need to have Node.js installed on your machine.

For running the IRC bots, you may need to get the Node.js module 'irc'.

PEGJS itself (slightly modified to work around our own bugs) is already included in this repo.

=== Building a PEGJS engine ===

After having entered the ilmentufa directory, run the following command:

$ node [builder-filename]

For example, "node camxes-builder" for building the standard grammar engine or "node camxes-exp-builder" for experimental grammar.

Now, the grammar engine should have been created/updated. Run "node camxes-exp.js 'ti mo'" or load "camxes-exp.html" to try it out. 


=== Running the IRC bots ===

Nothing easier; after having entered the ilmentufa directory, run the command "node ircbot/cipra-bot" (this is the main Lojban parser - other bots also exist).
The list of the channels joined by the bot can be found and edited within the bot script.

=== Other parsers ===

There are two separate attempts at parsing gua\spi here, neither complete; see guaspi.js.peg and guaspi-bnf.js.peg. There is also a copy of Randall Holmes's Loglan parser (loglan.js.peg), unmodified apart from the output format.

