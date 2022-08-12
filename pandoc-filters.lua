--[[
Strip out images that are not local, some chapters use YouTube embeds that otherwise break while building
See
https://github.com/jgm/pandoc/issues/4893
https://pandoc.org/lua-filters.html
https://github.com/pandoc/lua-filters
]]--
function Image(element)
  if element.src.sub(element.src, 1, string.len('http')) == 'http' then
    return {}
  end
end
