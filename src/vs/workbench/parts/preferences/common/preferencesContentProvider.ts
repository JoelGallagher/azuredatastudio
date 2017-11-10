/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { IModelService } from 'vs/editor/common/services/modelService';
import { IModeService } from 'vs/editor/common/services/modeService';
import URI from 'vs/base/common/uri';
import { TPromise } from 'vs/base/common/winjs.base';
import { IModel } from 'vs/editor/common/editorCommon';
import JSONContributionRegistry = require('vs/platform/jsonschemas/common/jsonContributionRegistry');
import { Registry } from 'vs/platform/registry/common/platform';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IPreferencesService } from 'vs/workbench/parts/preferences/common/preferences';

const schemaRegistry = Registry.as<JSONContributionRegistry.IJSONContributionRegistry>(JSONContributionRegistry.Extensions.JSONContribution);

export class PreferencesContentProvider implements IWorkbenchContribution {

	constructor(
		@IModelService private modelService: IModelService,
		@ITextModelService private textModelResolverService: ITextModelService,
		@IPreferencesService private preferencesService: IPreferencesService,
		@IModeService private modeService: IModeService
	) {
		this.start();
	}

	public getId(): string {
		return 'vs.contentprovider';
	}

	private start(): void {
		this.textModelResolverService.registerTextModelContentProvider('vscode', {
			provideTextContent: (uri: URI): TPromise<IModel> => {
				if (uri.scheme !== 'vscode') {
					return null;
				}
				if (uri.authority === 'schemas') {
					let schemas = schemaRegistry.getSchemaContributions().schemas;
					let schema = schemas[uri.toString()];
					if (schema) {
						let modelContent = JSON.stringify(schema);
						let mode = this.modeService.getOrCreateMode('json');
						return TPromise.as(this.modelService.createModel(modelContent, mode, uri));
					}
				}
				return this.preferencesService.resolveContent(uri)
					.then(content => {
						if (content !== null && content !== void 0) {
							let mode = this.modeService.getOrCreateMode('json');
							const model = this.modelService.createModel(content, mode, uri);
							return TPromise.as(model);
						}
						return null;
					});
			}
		});
	}
}
