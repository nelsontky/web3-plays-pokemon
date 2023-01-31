import { FormControl, InputLabel, MenuItem } from "@mui/material";
import Select from "@mui/material/Select";
import { POKEMON_PIXEL_FONT, SUPPORTED_SPL_TOKENS } from "common";
import tw from "twin.macro";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { setGasCurrency } from "../slices/gasCurrencySlice";
import HelpTooltip from "./HelpTooltip";

const styles = {
  root: tw`
    w-32
  `,
  text: tw`
    text-xl
  `,
};

const menuItemStyles = {
  "&.Mui-selected": {
    backgroundColor: "rgba(0, 0, 0, 0.04) !important",
  },
};

interface SelectGasCurrencyProps {
  css?: any;
}

export default function SelectGasCurrency({
  css,
  ...rest
}: SelectGasCurrencyProps) {
  const selectedGasCurrency = useAppSelector((state) => state.gasCurrency);
  const dispatch = useAppDispatch();

  const handleChange = (event: any) => {
    dispatch(
      setGasCurrency(event.target.value === 0 ? null : event.target.value)
    );
  };

  return (
    <div css={[tw`flex items-center`, css]} {...rest}>
      <FormControl
        size="small"
        css={styles.root}
        sx={{
          "& *": {
            color: "#000000 !important",
            borderColor: "#000000 !important",
          },
          "& .Mui-selected": {
            backgroundColor: "rgba(0, 0, 0, 0.04) !important",
          },
        }}
      >
        <InputLabel style={POKEMON_PIXEL_FONT.style} css={styles.text}>
          Gas currency
        </InputLabel>
        <Select
          label="Gas currency"
          value={
            (selectedGasCurrency === null ? 0 : selectedGasCurrency) as any
          }
          onChange={handleChange}
          style={POKEMON_PIXEL_FONT.style}
          css={styles.text}
        >
          <MenuItem
            value={0}
            style={POKEMON_PIXEL_FONT.style}
            css={styles.text}
            sx={menuItemStyles}
          >
            SOL
          </MenuItem>
          {Object.entries(SUPPORTED_SPL_TOKENS).map(([mint, symbol]) => (
            <MenuItem
              key={mint}
              value={mint}
              style={POKEMON_PIXEL_FONT.style}
              css={styles.text}
              sx={menuItemStyles}
            >
              {symbol}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <HelpTooltip>
        Select the currency you wish to pay for transaction fees in. If choosing
        a currency other than SOL, you do not need any SOL in your wallet, and
        you will be paying an equivalent amount of the other currency as the
        normal transaction costs. This amount might change according to the
        price of the currency.
      </HelpTooltip>
    </div>
  );
}
