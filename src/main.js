'use strict'

import { Game } from "./game.js";

window.onload = () =>
{
    new Game(800, 600).start();
};