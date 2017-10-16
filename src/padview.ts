'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import IFormatProvider from './formatters/IFormatProvider'
import RawFormatProvider from './formatters/RawFormatProvider';
import ResourceLocator from './theming/ResourceLocator'

export default class PadViewContentProvider implements vscode.TextDocumentContentProvider
{
    private _formatters: Array<IFormatProvider> = [];
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

    private _stylesheets: string[] = [];
    private _scripts: string[] = [];

    private _defaultMessage = "";

    constructor()
    {
        var self = this;

        this._stylesheets.push(ResourceLocator.getResource("theme.css"));
        this._stylesheets.push(ResourceLocator.getResource("themes", "dark.css"));
        this._scripts.push(ResourceLocator.getResource("collapser.js"));
    }

    get onDidChange(): vscode.Event<vscode.Uri>
    {
        return this._onDidChange.event;
    }

    public add(formatter: IFormatProvider)
    {
        this._formatters.push(formatter);
    }

    public update(uri: vscode.Uri)
    {
        this._onDidChange.fire(uri);
    }

    public addAndUpdate(uri: vscode.Uri, formatter: IFormatProvider)
    {
        this.add(formatter);
        this.update(uri);
    }

    public clear(uri: vscode.Uri, message: string = "")
    {
        this._formatters = [];
        
        if (message)
        {
            this._defaultMessage = message;
        }

        this.update(uri);
    }

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string>
    {
        let builder = "";

        for (let css of this._stylesheets)
        {
            builder += `<link rel='stylesheet' href='${css}'>`;
        }

        builder += `<header><div>${this._formatters.length} entries</div><button class='toggleAll'>Toggle All</button></header><div class='dumpContainer'>`;

        if (this._formatters.length > 0)
        {
            for (let formatter of this._formatters)
            {
                builder += `<div class='dump'>${formatter.formatToHtml()}<div class='time'>${formatter.date.toLocaleTimeString()} + ${formatter.date.getMilliseconds()}ms</div></div>`;
            }
        }
        else
        {
            builder += `<h1>${this._defaultMessage}</h1>`;
        }

        builder += '</div>';
        
        for (let js of this._scripts)
        {
            builder += `<script src='${js}'></script>`;
        }

        return builder;
    }
}