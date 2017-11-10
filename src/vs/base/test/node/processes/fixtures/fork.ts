/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import processes = require('vs/base/node/processes');

const sender = processes.createQueuedSender(process);

process.on('message', msg => {
	sender.send(msg);
});

sender.send('ready');