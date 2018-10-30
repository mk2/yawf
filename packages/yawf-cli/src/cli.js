#!/usr/bin/env node

import yargs from 'yargs'
import generate from './generate'
import start from './start'

yargs.command(generate).command(start).help().argv
