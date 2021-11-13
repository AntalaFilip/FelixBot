import { Link, makeStyles, Typography } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
	root: {

	},
	header: {
		textAlign: 'center',
	}
}))

function Discord() {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<div className={classes.header}>
				<Typography variant="h3">Ako sa pripojiť k online vyučovaniu</Typography>
			</div>
			<div>
				<Typography variant="h6">
					Obsiahlejší tutoriál (ako sa prihásiť a aj ako používať Discord) <Link href="https://docs.google.com/document/d/1VtEMX7X_mlfYgZbllDJZsNL2_tv0-fnt3_oQ62tmmOY">nájdete tu</Link>.
				</Typography>
			</div>
			<br/>
			<div>
				<Typography variant="h5">Zjednodušený tutoriál:</Typography>
				<ol>
					<li>Otvorte si link do Felixáckeho Discord prostredia: <Link href="https://discord.gg/kKh8BeS">https://discord.gg/kKh8BeS</Link></li>
					<li>Ak už máte účet, prihláste sa. Ak nemáte, vytvore si používateľské meno.</li>
					<Typography color="error">pozn.: kvôli legislatíve EÚ by ste mali zadať email a dátum narodenia rodiča ak máte menej ako 13 rokov.</Typography>
					<li>Postupujte podľa ďalších inštrukcií.</li>
					<li>Po vytvorení účtu prejdite do Felix prostredia kliknutím na Felix logo v liste prostredí vľavo.</li>
					<li>Vo Felix prostredí kliknite na "Complete" v modrej varovnej hláške navrchu a udeľte súhlas s pravidlami prostredia.</li>
					<li>Keď dokončíte membership screening (dotazník), príde Vám automatická správa, postupujte podľa inštrukcií v nej, aby
					ste sa identifikovali a bola Vám priradená trieda.</li>
				</ol>
			</div>
		</div>
	)
}

export default Discord;