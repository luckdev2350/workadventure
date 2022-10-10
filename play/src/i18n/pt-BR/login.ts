import type { DeepPartial } from "../DeepPartial";
import type { Translation } from "../i18n-types";

const login: DeepPartial<Translation["login"]> = {
    input: {
        name: {
            placeholder: "Digite seu nome",
            empty: "O nome está vazio",
            tooLongError: "O nome é muito longo",
            notValidError: "O nome não é válido",
        },
    },
    terms: 'Ao continuar, você concorda com nossos <a href="https://workadventu.re/terms-of-use" target="_blank">termos de uso</a> e <a href="https://workadventu.re/cookie-policy" target="_blank">política de privacidade de cookies</a>.',
    continue: "Continuar",
};

export default login;
