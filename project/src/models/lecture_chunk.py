from dataclasses import dataclass
from typing import Optional

@dataclass
class LectureChunk:
    module_code: str                # EE6250, CS3002, ...
    source_file: str                # filename.pdf
    chunk_id: int                   # 0-based within that file
    text: str

    def embedding_payload(self) -> str:
        """What goes to the embedder (plain text is fine)."""
        return self.text
