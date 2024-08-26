import type { ChakraProps } from '@invoke-ai/ui-library';
import { Combobox, FormControl, FormLabel } from '@invoke-ai/ui-library';
import { createMemoizedSelector } from 'app/store/createMemoizedSelector';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { InformationalPopover } from 'common/components/InformationalPopover/InformationalPopover';
import { useGroupedModelCombobox } from 'common/hooks/useGroupedModelCombobox';
import { loraAdded } from 'features/controlLayers/store/canvasV2Slice';
import { selectCanvasV2Slice } from 'features/controlLayers/store/selectors';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoRAModels } from 'services/api/hooks/modelsByType';
import type { LoRAModelConfig } from 'services/api/types';

const selectLoRAs = createMemoizedSelector(selectCanvasV2Slice, (canvasV2) => canvasV2.loras);

const LoRASelect = () => {
  const dispatch = useAppDispatch();
  const [modelConfigs, { isLoading }] = useLoRAModels();
  const { t } = useTranslation();
  const addedLoRAs = useAppSelector(selectLoRAs);
  const currentBaseModel = useAppSelector((s) => s.canvasV2.params.model?.base);

  const getIsDisabled = (model: LoRAModelConfig): boolean => {
    const isCompatible = currentBaseModel === model.base;
    const isAdded = Boolean(addedLoRAs.find((lora) => lora.model.key === model.key));
    const hasMainModel = Boolean(currentBaseModel);
    return !hasMainModel || !isCompatible || isAdded;
  };

  const _onChange = useCallback(
    (model: LoRAModelConfig | null) => {
      if (!model) {
        return;
      }
      dispatch(loraAdded({ model }));
    },
    [dispatch]
  );

  const { options, onChange } = useGroupedModelCombobox({
    modelConfigs,
    getIsDisabled,
    onChange: _onChange,
  });

  const placeholder = useMemo(() => {
    if (isLoading) {
      return t('common.loading');
    }

    if (options.length === 0) {
      return t('models.noLoRAsInstalled');
    }

    return t('models.addLora');
  }, [isLoading, options.length, t]);

  const noOptionsMessage = useCallback(() => t('models.noMatchingLoRAs'), [t]);

  return (
    <FormControl isDisabled={!options.length}>
      <InformationalPopover feature="lora">
        <FormLabel>{t('models.concepts')} </FormLabel>
      </InformationalPopover>
      <Combobox
        placeholder={placeholder}
        value={null}
        options={options}
        noOptionsMessage={noOptionsMessage}
        onChange={onChange}
        data-testid="add-lora"
        sx={selectStyles}
      />
    </FormControl>
  );
};

export default memo(LoRASelect);

const selectStyles: ChakraProps['sx'] = {
  w: 'full',
};
