#!/usr/bin/env python
# -*- coding: utf-8 -*-

import zconf

zconf.create_project('purchasing-enrichment-tool')

zconf.create_or_update_config_key('pet.toggle.production.restriction', ['purchasing-enrichment-tool'], 'Boolean',
                                  comment='First Key')

zconf.create_or_update_config_value('pet.toggle.production.restriction', True, comment='First Value')
